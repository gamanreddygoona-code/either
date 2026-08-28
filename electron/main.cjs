const { app, BrowserWindow, Menu, Tray, shell, nativeImage, ipcMain } = require('electron');
const path = require('path');
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
let trayUpdateInterval = null;

// Primary Cloud Server URL (Runs completely on our deployed cloud infrastructure)
const CLOUD_URL = process.env.EITHER_CLOUD_URL || 'https://either-ai.vercel.app';
const LOCAL_PORT = process.env.PORT || 3000;
const LOCAL_URL = `http://127.0.0.1:${LOCAL_PORT}`;

// Determine target server URL:
// Connect directly to our Sovereign Cloud Cluster with zero terminal required!
let ACTIVE_SERVER_URL = CLOUD_URL;

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

ipcMain.on('switch-server', (_event, target) => {
  if (mainWindow) {
    ACTIVE_SERVER_URL = target === 'local' ? LOCAL_URL : CLOUD_URL;
    mainWindow.loadURL(`${ACTIVE_SERVER_URL}/?app=1&desktop=1`);
  }
});

async function resolveBestServerUrl() {
  if (process.env.ELECTRON_FORCE_LOCAL === '1') {
    return LOCAL_URL;
  }
  // Default to our cloud server for instant zero-terminal user experience
  return CLOUD_URL;
}

function createWindow() {
  const icoPath = path.join(__dirname, '..', 'public', 'icons', 'icon.ico');
  const pngPath = path.join(__dirname, '..', 'public', 'icons', 'icon-512.png');
  const appIcon = fs.existsSync(icoPath) ? icoPath : pngPath;

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#090a0f',
    title: 'Either — Sovereign AI Workspace',
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

  const appUrl = `${ACTIVE_SERVER_URL}/?app=1&desktop=1`;
  console.log('[Either Desktop] Connecting to Sovereign Cloud Cluster:', appUrl);
  mainWindow.loadURL(appUrl);

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Handle load failure gracefully
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.warn('[Either Desktop] Load notification:', errorCode, errorDescription);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Open external links in system browser, keep app navigation inside
    if (url.startsWith(CLOUD_URL) || url.startsWith(LOCAL_URL)) return { action: 'allow' };
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  function updateTrayAndTitle() {
    const title = 'Either — Sovereign AI Workspace';
    if (mainWindow) mainWindow.setTitle(title);
    if (tray) {
      tray.setToolTip(`Either AI Workspace\nConnected to Cloud Sovereign Cluster\nDouble-click to show`);
      const ctx = Menu.buildFromTemplate([
        { label: 'Either — Sovereign AI Workspace', enabled: false },
        { label: '🟢 Cloud Server: Online', enabled: false },
        { type: 'separator' },
        { label: 'Open Either Workspace', click: () => mainWindow ? (mainWindow.show(), mainWindow.focus()) : createWindow() },
        { label: 'Reload Canvas', click: () => mainWindow && mainWindow.reload() },
        { label: 'Open in Web Browser', click: () => shell.openExternal(CLOUD_URL) },
        { type: 'separator' },
        { label: 'Quit Either AI', click: () => app.quit() },
      ]);
      tray.setContextMenu(ctx);
    }
  }

  try {
    const iconPath = path.join(__dirname, '..', 'public', 'icons', 'icon-512.png');
    let trayIcon = nativeImage.createFromPath(iconPath);
    if (!trayIcon.isEmpty()) {
      trayIcon = trayIcon.resize({ width: 16, height: 16 });
      tray = new Tray(trayIcon);
      updateTrayAndTitle();
      trayUpdateInterval = setInterval(updateTrayAndTitle, 15000);
      tray.on('double-click', () => mainWindow && (mainWindow.show(), mainWindow.focus()));
    }
  } catch (e) { console.warn('Tray failed:', e.message); }

  const menu = Menu.buildFromTemplate([
    {
      role: 'appMenu',
      submenu: [
        { label: 'About Either AI', click: () => shell.openExternal(CLOUD_URL) },
        { type: 'separator' },
        { role: 'quit', label: 'Quit Either AI' }
      ]
    },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    {
      label: 'Sovereign Cluster',
      submenu: [
        { label: 'Cloud Sovereign Cluster (Primary)', click: () => { if (mainWindow) { ACTIVE_SERVER_URL = CLOUD_URL; mainWindow.loadURL(`${CLOUD_URL}/?app=1&desktop=1`); } } },
        { label: 'Local Development Node (127.0.0.1:3000)', click: () => { if (mainWindow) { ACTIVE_SERVER_URL = LOCAL_URL; mainWindow.loadURL(`${LOCAL_URL}/?app=1&desktop=1`); } } },
        { type: 'separator' },
        { label: 'Live Server Telemetry', click: () => shell.openExternal(`${CLOUD_URL}/api/health`) },
      ]
    },
    { role: 'windowMenu' },
    {
      label: 'Help',
      submenu: [
        { label: 'Open in Browser', click: () => shell.openExternal(CLOUD_URL) },
        { label: 'Reload Workspace', click: () => mainWindow && mainWindow.reload() },
        { label: 'Toggle Developer Tools', accelerator: 'F12', click: () => mainWindow && mainWindow.webContents.toggleDevTools() },
        { type: 'separator' },
        { label: 'Either Desktop • Cloud Connected', enabled: false },
      ]
    },
  ]);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(async () => {
  ACTIVE_SERVER_URL = await resolveBestServerUrl();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (trayUpdateInterval) clearInterval(trayUpdateInterval);
    app.quit();
  }
});

app.on('before-quit', () => {
  if (trayUpdateInterval) clearInterval(trayUpdateInterval);
});
