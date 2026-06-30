import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('petHost', {
    getPetState: () => ipcRenderer.invoke('pet:get-state'),
});
