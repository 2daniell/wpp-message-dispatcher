const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('botAPI', {
  createBot: (name, reqId) => ipcRenderer.invoke('create-bot', { name, reqId }),
  closeApp: () => ipcRenderer.send('close-app'),
  listBots: () => ipcRenderer.invoke('list-bots'),
  getQRCodeData: (data, canvas) => ipcRenderer.invoke('generate-qr', {data, canvas}),
  onBotEvent: (reqId, callback) => {
    ipcRenderer.on(`bot-msg-${reqId}`, (_, data) => callback(data));
  },
  onStatusUpdate: (callback) => {
    ipcRenderer.on('update-status', (_, data) => callback(data));
  },
});
