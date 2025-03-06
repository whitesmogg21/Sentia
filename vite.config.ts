import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from 'vite-plugin-pwa';
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Use relative paths for assets in Electron
  base: './',
  
  // Server configuration for development
  server: {
    host: 'localhost', // Changed from '::' to 'localhost' for better compatibility
    port: 8080, // Updated to use port 8080
    strictPort: true, // Ensure the server uses exactly port 8080
    hmr: {
      overlay: true,
    },
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: mode === 'development', // Generate sourcemaps in development
    // Optimize chunks for Electron
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react', 
            'react-dom', 
            'react-router-dom',
            '@tanstack/react-query'
          ],
          ui: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            // Add other UI libraries as needed
          ]
        }
      }
    }
  },
  
  // Plugins
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true // Enable PWA in development
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
        runtimeCaching: [{
          urlPattern: /^https:\/\/api\.your-backend\.com\/.*$/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 // 24 hours
            }
          }
        }]
      },
      manifest: {
        name: 'Sentia',
        short_name: 'Quiz',
        description: 'A Progressive Web App for quizzes',
        theme_color: '#9b87f5',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    // Only use componentTagger in development mode
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  
  // Path aliases for cleaner imports
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Add electron-specific aliases if needed
      "electron": path.resolve(__dirname, "./electron"),
    },
    // Ensure .cjs files are properly resolved
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.cjs']
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      // Add other frequently used dependencies
    ],
    exclude: [
      'electron'
    ]
  },
  
  // Environment variables
  define: {
    'process.env.IS_ELECTRON': JSON.stringify(true),
    'process.env.NODE_ENV': JSON.stringify(mode)
  },
  
  // CSS configuration
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      // Add preprocessor options if needed
    }
  },
  
  // Prevent Vite from clearing the console
  clearScreen: false,
  
  // Configure logger
  logLevel: mode === 'development' ? 'info' : 'warn',
}));
