const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

console.log('Electron app starting...');
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Environment:', process.env.NODE_ENV);

let mainWindow;

function createWindow() {
  console.log('Creating window...');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: isDev ? false : true, // Only disable in development
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // In development, use the Vite dev server
  if (isDev) {
    const url = 'http://localhost:8081';
    console.log('Loading from dev server:', url);
    mainWindow.loadURL(url);
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built HTML file
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('Loading HTML from:', indexPath);
    console.log('File exists:', fs.existsSync(indexPath));
    
    if (fs.existsSync(indexPath)) {
      console.log('Loading index.html...');
      mainWindow.loadFile(indexPath);
    } else {
      console.error('Error: index.html not found at', indexPath);
      // Try to load a fallback
      mainWindow.loadURL('data:text/html,<h1>Error: Could not load application</h1><p>The application files were not found.</p>');
    }
  }

  // Log when the page finishes loading
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });

  // Log any load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
    mainWindow.loadURL(`data:text/html,<h1>Error: ${errorCode}</h1><p>${errorDescription}</p>`);
  });

  // Log console messages from renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer Console]: ${message}`);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  console.log('App is ready');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});