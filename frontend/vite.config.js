import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  let rawApiUrl =
    process.env.VITE_API_URL ||
    env.VITE_API_URL ||
    process.env.REACT_APP_API_URL ||
    env.REACT_APP_API_URL ||
    'http://localhost:5000/api';

  // Handle accidental multi-line pastes into Vercel environment variables
  if (rawApiUrl.includes('\n') || rawApiUrl.includes('\r')) {
    const lines = rawApiUrl.split(/[\r\n]+/).map((s) => s.trim()).filter(Boolean);
    rawApiUrl = lines[lines.length - 1] || 'http://localhost:5000/api';
  }

  let apiUrl = rawApiUrl.trim().replace(/\/$/, '');
  if (!apiUrl.endsWith('/api')) {
    apiUrl += '/api';
  }

  return {
    plugins: [react()],
    define: {
      'process.env.REACT_APP_API_URL': JSON.stringify(apiUrl),
      'process.env': {},
    },
    server: {
      port: 3000,
      open: false,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  };
});

