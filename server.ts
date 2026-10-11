import 'dotenv/config';
import path from 'express';
import express from 'express';
import nodePath from 'path';
import { createServer as createViteServer } from 'vite';
import { app } from './src/server/app';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  // Always serve public directory directly with caching headers for performance
  app.use(
    express.static(nodePath.join(process.cwd(), 'public'), {
      maxAge: '1d',
      setHeaders: (res, filePath) => {
        if (filePath.includes('/optimized/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (/\.(png|jpg|jpeg|webp|svg|ico)$/i.test(filePath)) {
          res.setHeader('Cache-Control', 'public, max-age=86400');
        }
      },
    })
  );

  // Vite middleware in development vs Static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = nodePath.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(nodePath.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Shree Sai Developers server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
