import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function productStoragePlugin(): Plugin {
  const jsonPath = path.resolve(__dirname, 'src/data/products.json');
  const coversPath = path.resolve(__dirname, 'src/data/covers.json');
  const categoriesPath = path.resolve(__dirname, 'src/data/categories.json');

  return {
    name: 'product-storage-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';
        
        // --- Products API ---
        if (url === '/api/products' && req.method === 'GET') {
          try {
            if (fs.existsSync(jsonPath)) {
              const data = fs.readFileSync(jsonPath, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(data);
              return;
            }
          } catch (e) {
            console.error('Error reading products.json:', e);
          }
        }

        if (url === '/api/products' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to write products.json' }));
            }
          });
          return;
        }

        // --- Categories API ---
        if (url === '/api/categories' && req.method === 'GET') {
          try {
            if (fs.existsSync(categoriesPath)) {
              const data = fs.readFileSync(categoriesPath, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(data);
              return;
            }
          } catch (e) {
            console.error('Error reading categories.json:', e);
          }
        }

        if (url === '/api/categories' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              fs.writeFileSync(categoriesPath, JSON.stringify(parsed, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to write categories.json' }));
            }
          });
          return;
        }

        // --- Covers API ---
        if (url === '/api/covers' && req.method === 'GET') {
          try {
            if (fs.existsSync(coversPath)) {
              const data = fs.readFileSync(coversPath, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(data);
              return;
            }
          } catch (e) {
            console.error('Error reading covers.json:', e);
          }
        }

        if (url === '/api/covers' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              fs.writeFileSync(coversPath, JSON.stringify(parsed, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to write covers.json' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), productStoragePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: [
          '**/src/data/products.json',
          '**/products.json',
          '**/src/data/covers.json',
          '**/covers.json',
          '**/src/data/categories.json',
          '**/categories.json'
        ],
      },
    },
  };
});
