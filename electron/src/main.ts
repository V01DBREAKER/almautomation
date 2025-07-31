import { app, BrowserWindow, session } from 'electron';
import * as fs from 'node:fs';

function createWindow(): void {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadURL('http://localhost:5222');
}

app.whenReady().then(createWindow);

app.on('ready', () => {
  const cert = fs.readFileSync("./secrets/server.cert");
  // Add the certificate to the session
  session.defaultSession.setCertificateVerifyProc((request: Electron.Request, callback: (result: number) => void) => {
    if (request.hostname === 'localhost') { // Replace with your backend URL
      callback(0); // Accept the certificate
    } else {
      callback(-2); // Reject the certificate
    }
  });
});