interface ElectronAPI {
    removePreloader: () => void;
    // Add other Electron API methods you expose
  }
  
  interface Window {
    electronAPI: ElectronAPI;
  }