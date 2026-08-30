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

// Secure GPU configuration without disabling sandbox
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');

let mainWindow = null;
let tray = null;
let trayUpdateInterval = null;

// Allowlisted Origins for Either Desktop
const ALLOWED_ORIGINS = [
  'https://either-ai.vercel.app',
  'https://littlebird-ai.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

function isOriginAllowed(targetUrl) {
  try {
    const parsed = new URL(targetUrl);
    return ALLOWED_ORIGINS.some(allowed => {
      const a = new URL(allowed);
      return parsed.origin === a.origin;
    });
  } catch {
    return false;
  }
}

// Primary Cloud Server URL (Runs completely on our deployed cloud infrastructure)
const CLOUD_URL = process.env.EITHER_CLOUD_URL || 'https://either-ai.vercel.app';
const LOCAL_PORT = process.env.PORT || 3000;
const LOCAL_URL = `http://127.0.0.1:${LOCAL_PORT}`;

// Determine target server URL:
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
    if (isOriginAllowed(ACTIVE_SERVER_URL)) {
      mainWindow.loadURL(`${ACTIVE_SERVER_URL}/?app=1&desktop=1`);
    }
  }
});

async function resolveBestServerUrl() {
  if (process.env.ELECTRON_FORCE_LOCAL === '1') {
    return LOCAL_URL;
  }
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
      sandbox: true,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      spellcheck: false,
      enableRemoteModule: false
    },
    titleBarStyle: 'default',
    autoHideMenuBar: true,
    show: false,
    center: true,
  });

  // Inject strict Content Security Policy (CSP) headers
  const { session } = require('electron');
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' https://either-ai.vercel.app https://littlebird-ai.vercel.app http://127.0.0.1:3000 http://localhost:3000; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://accounts.google.com; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "font-src 'self' data: https://fonts.gstatic.com; " +
          "img-src 'self' data: blob: https:; " +
          "connect-src 'self' https://either-ai.vercel.app https://littlebird-ai.vercel.app http://127.0.0.1:3000 http://localhost:3000 https://api.binance.com https://*.googleapis.com https://api.github.com https://api.notion.com https://slack.com https://discord.com https://api.linear.app https://app.asana.com https://image.pollinations.ai; " +
          "frame-src 'self' https://accounts.google.com https://github.com https://web.whatsapp.com;"
        ]
      }
    });
  });

  const appUrl = `${ACTIVE_SERVER_URL}/?app=1&desktop=1`;
  console.log('[Either Desktop] Connecting securely to Sovereign Cluster:', appUrl);
  mainWindow.loadURL(appUrl);

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Strict navigation guard
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    if (!isOriginAllowed(navigationUrl)) {
      event.preventDefault();
      console.warn('[Either Desktop Security] Blocked unallowed origin navigation:', navigationUrl);
      if (navigationUrl.startsWith('http://') || navigationUrl.startsWith('https://')) {
        shell.openExternal(navigationUrl);
      }
    }
  });

  // Strict window open guard
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isOriginAllowed(url)) {
      return { action: 'allow' };
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'deny' };
  });

  // Handle load failure gracefully
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.warn('[Either Desktop] Load notification:', errorCode, errorDescription);
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
