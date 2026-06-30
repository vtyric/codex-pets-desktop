import { app, BrowserWindow, ipcMain, screen } from 'electron';
import { join } from 'node:path';

let petWindow: BrowserWindow | null = null;

function createPetWindow(): void {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    petWindow = new BrowserWindow({
        width: 320,
        height: 360,
        x: width - 380,
        y: height - 420,
        frame: false,
        transparent: true,
        resizable: false,
        movable: true,
        alwaysOnTop: true,
        hasShadow: false,
        skipTaskbar: true,
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    petWindow.setAlwaysOnTop(true, 'screen-saver');

    const devServerUrl = process.env.PET_SHELL_DEV_SERVER_URL;

    if (devServerUrl) {
        void petWindow.loadURL(devServerUrl);
        petWindow.webContents.openDevTools({ mode: 'detach' });
        return;
    }

    void petWindow.loadFile(join(__dirname, '../pet-shell/browser/index.html'));
}

app.whenReady().then(() => {
    ipcMain.handle('pet:get-state', () => {
        return {
            id: 'default',
            name: 'Default Pet',
            mood: 'idle',
            action: 'stand',
        };
    });

    createPetWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createPetWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
