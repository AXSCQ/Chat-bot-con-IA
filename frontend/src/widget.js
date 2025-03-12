import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './components/ChatWidget';

// Función para inicializar el widget en cualquier contenedor
export function initChatWidget(containerId, config = {}) {
  const container = document.getElementById(containerId);
  if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <ChatWidget config={config} />
      </React.StrictMode>
    );
    return true;
  }
  return false;
}

// Exponer el inicializador globalmente
window.DiputadosChat = {
  init: function(containerId, config) {
    return initChatWidget(containerId, config);
  }
};

// Auto-inicialización si el elemento root existe
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    initChatWidget('root');
  }
}); 