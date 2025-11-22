import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Kredyt30/',
  build: {
    outDir: 'dist',
  },
  publicDir: 'public', // Vite domyślnie szuka tu plików statycznych, ale obsłuży też pliki w root jeśli są podlinkowane
});