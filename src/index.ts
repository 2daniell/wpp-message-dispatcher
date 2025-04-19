import { app, BrowserWindow, ipcMain, Menu } from "electron"
import path from "path";
import { BotManager } from "./bot/BotManager";
import Qrious from "qrious"

let win: BrowserWindow | null = null

function createWindow() {

    win = new BrowserWindow({
        width: 1000,
        height: 700,
        frame: false,
        resizable: false,
        transparent: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    })

    
    Menu.setApplicationMenu(null)
    win.loadFile(path.join(__dirname, 'ui', 'index.html'));

    //win.webContents.openDevTools();
    
    win.on('closed', () => {
      win = null;
    });

}

ipcMain.on('close-app', () => {
    BrowserWindow.getAllWindows()[0].close();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('create-bot', async (event, { name, reqId }) => {
    await BotManager.start(
      name,
      (qr) => {
        win?.webContents.send(`bot-msg-${reqId}`, { type: 'qr', qr });
      },
      () => {
        win?.webContents.send(`bot-msg-${reqId}`, { type: 'ready' });
      }
    );
});

ipcMain.handle("list-bots", async () => {
    return BotManager.getBots();
})

ipcMain.handle('generate-qr', async (event, { data, canvas}) => {
    try {
      const qr = new Qrious({
        element: canvas,
        value: data,
        size: 250
      })
    } catch (err) {
      console.error(err);
    }
});
  

app.whenReady().then(async () => {
  createWindow()
  BotManager.setWindowRef(win);
  await BotManager.initDatabase();
  await BotManager.loadPersistedBots();
});