console.log('Preload script executing...');

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded');
  console.log('Current URL:', window.location.href);
  console.log('Document title:', document.title);
  console.log('Body content:', document.body.innerHTML.substring(0, 500) + '...');
  
  // Add a visible element to the page to check if scripts are running
  const debugDiv = document.createElement('div');
  debugDiv.style.position = 'fixed';
  debugDiv.style.top = '10px';
  debugDiv.style.left = '10px';
  debugDiv.style.padding = '10px';
  debugDiv.style.backgroundColor = 'red';
  debugDiv.style.color = 'white';
  debugDiv.style.zIndex = '9999';
  debugDiv.textContent = 'Preload script executed at ' + new Date().toLocaleTimeString();
  document.body.appendChild(debugDiv);
});







// // electron/preload.cjs
// const { contextBridge, ipcRenderer } = require('electron');

// // Log that preload is running
// console.log('Preload script running...');

// // Expose any APIs to the renderer process if needed
// contextBridge.exposeInMainWorld('electronAPI', {
//   // Add any functions you want to expose to your renderer process
//   getAppVersion: () => process.versions.electron,
//   platform: process.platform
// });

// // Log that preload has completed
// console.log('Preload script completed');
