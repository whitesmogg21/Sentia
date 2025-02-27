import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then(registration => {
//         console.log('ServiceWorker registration successful:', registration.scope);
//       })
//       .catch(error => {
//         console.log('ServiceWorker registration failed:', error);
//       });
//   });
// }

createRoot(document.getElementById("root")!).render(<App />);
