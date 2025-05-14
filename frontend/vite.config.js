// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  base: '/WuSAP/', // ← add this line (case-sensitive)
  plugins: [react()],
})