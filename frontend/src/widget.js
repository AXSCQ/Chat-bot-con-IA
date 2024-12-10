import { initChatWidget } from './components/ChatWidget';

// Exponer el inicializador globalmente
window.DiputadosChat = {
    init: function(containerId, config) {
        initChatWidget(containerId, config);
    }
}; 