import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
  
  // Si estamos en build, configuramos para generar una biblioteca
  if (command === 'build') {
    config.build = {
      lib: {
        entry: 'src/widget.js',
        name: 'DiputadosChat',
        fileName: (format) => `widget.${format}.js`
      },
      rollupOptions: {
        // Asegurarse de que React y ReactDOM no se incluyan en el bundle
        external: ['react', 'react-dom'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM'
          }
        }
      }
    };
  }
  
  return config;
}) 