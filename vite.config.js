import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: ['.web.jsx', '.web.js', '.jsx', '.js', '.ts', '.tsx'],
  },
  server: {
    port: 3000,
    open: true,
  },
});
