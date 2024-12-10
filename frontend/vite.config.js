import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/widget.js',
      name: 'DiputadosChat',
      fileName: 'widget'
    },
    rollupOptions: {
      output: {
        format: 'umd',
        name: 'DiputadosChat',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
}) 