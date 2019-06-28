const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

const argv = process.argv.slice(2);
let mainWindow;

function createWindow(width=1200, height=660) {
  return new BrowserWindow({
    width, height,
    minWidth: 800,
    minHeight: 600,
    autoHideMenuBar: false,
    title: '魔兽单体插件更新工具',
    webPreferences: {
      javascript: true,
      plugins: true,
      nodeIntegration: false, // 不集成 Nodejs
      webSecurity: false,
      preload: path.join(__dirname, `./public/renderer.js`) // 但预加载的 js 文件内仍可以使用 Nodejs 的 API
    }
  })
}

function createController () {
  ipcMain.on('baseAddons', require('./electron-main/controller/BaseAddons')); // 插件列表
  ipcMain.on(`downAddon`, require('./electron-main/controller/DownAddons')); // 下载并且解压插件到指定目录
  ipcMain.on(`searchAddons`, require('./electron-main/controller/SearchAddons')); // 插件搜索
  // ipcMain.on('addonDetail', require('./electron-main/controller/AddonDetail')); // 插件详情
  ipcMain.on('reloadWindow', () => {
    if (!mainWindow) {
      return;
    }
    mainWindow.reload();
  })
}

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  mainWindow = createWindow();
  mainWindow.on('closed', () => mainWindow = null);

  createController();

  if (argv && argv[1] === 'dev') {
    mainWindow.loadURL(`http://localhost:3001`);
    mainWindow.webContents.openDevTools();
    globalShortcut.register('f5', function() {
      mainWindow.reload();
    });
  } else if (argv && argv[1] === 'build') {
    mainWindow.loadURL(`file://${__dirname}/build/index.html`);
    mainWindow.webContents.openDevTools();
    globalShortcut.register('f5', function() {
      mainWindow.reload();
    });
  } else {
    mainWindow.loadURL(`file://${__dirname}/build/index.html`);
  }
});
