import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/codex-workflow-workbook/',
  plugins: [react()],
  server: {
    fs: {
      allow: ['..'],
    },
  },
});
