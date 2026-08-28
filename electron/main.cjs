const { app, BrowserWindow, Menu, Tray, shell, nativeImage, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

// Set Application User Model ID for Windows Taskbar pinning & grouping
app.setAppUserModelId('com.either.workspace');

// Set isolated user data to avoid Windows cache lock conflicts
try {
  const customUserData = path.join(os.homedir(), 'AppData', 'Local', 'EitherAIWorkspace');
  if (!fs.existsSync(customUserData)) fs.mkdirSync(customUserData, { recursive: true });
  app.setPath('userData', customUserData);
} catch (e) {}

app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('no-sandbox');

let mainWindow = null;
let tray = null;
let serverProcess = null;
const PORT = process.env.PORT || 3000;
const SERVER_URL = `http://127.0.0.1:${PORT}`;
let trayUpdateInterval = null;
let connectedServersCache = [];
let desktopNodeId = `desktop-${require('os').hostname().replace(/[^a-z0-9]/gi,'-').toLowerCase()}`;

// IPC Handlers for native window controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.on('window-reload', () => {
  if (mainWindow) mainWindow.reload();
});

function startServerIfNeeded() {
  // Check if server already responding
  const http = require('http');
  return new Promise((resolve) => {
    const req = http.get(SERVER_URL + '/api/health', (res) => {
      res.resume();
      if (res.statusCode === 200) {
        console.log('[Desktop] Server already running at', SERVER_URL);
        return resolve(true);
      }
      resolve(false);
    });
    req.on('error', () => {
      console.log('[Desktop] Starting embedded server...');
      const cjs = path.join(__dirname, '..', 'dist', 'server.cjs');
      if (!fs.existsSync(cjs)) {
        console.error('[Desktop] dist/server.cjs not found — run npm run build first');
        return resolve(false);
      }
      serverProcess = spawn(process.execPath, [cjs], {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env, PORT: String(PORT), NODE_ENV: 'production' },
        stdio: 'pipe',
      });
      serverProcess.stdout.on('data', d => console.log('[Server]', d.toString().trim()));
      serverProcess.stderr.on('data', d => console.error('[Server]', d.toString().trim()));
      // wait 4s for server to boot
      setTimeout(() => resolve(true), 4000);
    });
    req.setTimeout(2000, () => { req.destroy(); resolve(false); });
  });
}

function createWindow() {
  const icoPath = path.join(__dirname, '..', 'public', 'icons', 'icon.ico');
  const pngPath = path.join(__dirname, '..', 'public', 'icons', 'icon-512.png');
  const appIcon = fs.existsSync(icoPath) ? icoPath : pngPath;

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 880,
    minWidth: 1024,
    minHeight: 620,
    backgroundColor: '#faf8f5',
    title: 'Either AI Workspace',
    icon: appIcon,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      spellcheck: false,
    },
    titleBarStyle: 'default',
    autoHideMenuBar: true,
    show: false,
    center: true,
  });

  mainWindow.loadURL(SERVER_URL + '/?app=1&desktop=1');

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Open external links in system browser, keep app navigation inside
    if (url.startsWith(SERVER_URL)) return { action: 'allow' };
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  // Enhanced Tray — live server telemetry + connected servers
  function updateTrayAndTitle() {
    const http = require('http');
    http.get(SERVER_URL + '/api/servers', (res) => {
      let d=''; res.on('data', c=> d+=c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          const servers = j.servers || [];
          connectedServersCache = servers;
          const live = servers.filter((s)=> s.status==='online').length;
          const tel = j.realTelemetry;
          const cpu = tel ? `${tel.cpuUsagePercent}%` : '—';
          const mem = tel ? `${tel.memoryUsagePercent}%` : '—';
          const host = tel ? tel.hostname : 'Local';
          const title = `Littlebird — ${live} server${live===1?'':'s'} • ${host} CPU ${cpu} MEM ${mem}`;
          if (mainWindow) mainWindow.setTitle(title);
          if (tray) {
            tray.setToolTip(`Littlebird AI Workspace\n${live} server(s) online\n${host} • CPU ${cpu} • MEM ${mem}\nDouble-click to show`);
            const serverItems = servers.slice(0,4).map((s)=> ({
              label: `${s.status==='online'?'●':'○'} ${s.name} — ${s.host}:${s.port}  CPU ${s.cpuUsage}%  MEM ${s.memoryUsage}%`,
              enabled: false
            }));
            const ctx = Menu.buildFromTemplate([
              { label: title, enabled:false },
              { type:'separator' },
              ...serverItems,
              { type:'separator' },
              { label: 'Show Workspace', click: () => mainWindow ? (mainWindow.show(), mainWindow.focus()) : createWindow() },
              { label: 'Servers • Add / Manage', click: () => { if(mainWindow){ mainWindow.show(); mainWindow.loadURL(SERVER_URL + '/?app=1&view=servers'); } } },
              { label: 'Open in Browser', click: () => shell.openExternal(SERVER_URL) },
              { type:'separator' },
              { label: 'Quit Desktop App', click: () => app.quit() },
            ]);
            tray.setContextMenu(ctx);
          }
        } catch {}
      });
    }).on('error', ()=>{});
  }

  try {
    const iconPath = path.join(__dirname, '..', 'public', 'icons', 'icon-512.png');
    let trayIcon = nativeImage.createFromPath(iconPath);
    if (!trayIcon.isEmpty()) {
      trayIcon = trayIcon.resize({ width: 16, height: 16 });
      tray = new Tray(trayIcon);
      updateTrayAndTitle();
      trayUpdateInterval = setInterval(updateTrayAndTitle, 8000);
      tray.on('double-click', () => mainWindow && (mainWindow.show(), mainWindow.focus()));
    }
  } catch (e) { console.warn('Tray failed', e.message); }

  const menu = Menu.buildFromTemplate([
    { role: 'appMenu', submenu: [{ label:'About Littlebird', click:()=> shell.openExternal(SERVER_URL) }, { type:'separator' }, { role:'quit', label:'Quit Littlebird Desktop' }] },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { label: 'Servers', submenu: [
      { label:'Show All Servers', click:()=> { if(mainWindow){ mainWindow.show(); mainWindow.loadURL(SERVER_URL + '/?app=1&view=servers'); } } },
      { label:'Add Server / Node…', click:()=> { if(mainWindow){ mainWindow.show(); mainWindow.loadURL(SERVER_URL + '/?app=1&view=servers&add=1'); } } },
      { type:'separator' },
      { label:'Local Node — 127.0.0.1:3000', click:()=> shell.openExternal(SERVER_URL + '/api/servers') },
      { label:'Health Check', click:()=> shell.openExternal(SERVER_URL + '/api/health') },
    ]},
    { role: 'windowMenu' },
    { label: 'Help', submenu: [
      { label:'Open in Browser', click: () => shell.openExternal(SERVER_URL) },
      { label:'Reload Workspace', click: () => mainWindow && mainWindow.reload() },
      { label:'Toggle DevTools', accelerator:'F12', click: () => mainWindow && mainWindow.webContents.toggleDevTools() },
      { type:'separator' },
      { label:'Littlebird on Desktop — Connected to your servers', enabled:false },
    ]},
  ]);
  Menu.setApplicationMenu(menu);
  // Register this Windows desktop as a node (best-effort, 2s after load)
  setTimeout(()=>{
    const http = require('http');
    const os = require('os');
    const hostname = os.hostname();
    const postData = JSON.stringify({ name: `Windows Desktop — ${hostname}`, host: '127.0.0.1', port: PORT, type: 'local-wifi' });
    const req = http.request(SERVER_URL + '/api/servers/add', { method:'POST', headers:{'Content-Type':'application/json'} }, (res)=>{ res.resume(); });
    req.on('error', ()=>{});
    req.write(postData); req.end();
  }, 2500);
}

app.whenReady().then(async () => {
  await startServerIfNeeded();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) { try { serverProcess.kill(); } catch(e){} }
    if (trayUpdateInterval) clearInterval(trayUpdateInterval);
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) { try { serverProcess.kill(); } catch(e){} }
  if (trayUpdateInterval) clearInterval(trayUpdateInterval);
});
