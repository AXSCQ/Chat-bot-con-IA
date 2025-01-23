import React, { useState, useEffect } from 'react';
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    TypingIndicator
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import axios from 'axios';
import './ChatWidget.css';
import logoLegislatura from '../assets/logo-legislatura.png';

// Componente ChatWidget
const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Mensaje de bienvenida inicial
        const welcomeMessage = {
            message: "¡Hola! Soy tu asistente virtual para consultas sobre proyectos de ley. ¿En qué puedo ayudarte?",
            sender: "bot",
            direction: "incoming"
        };
        setMessages([welcomeMessage]);
    }, []);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSend = async (messageText) => {
        try {
            // Agregar mensaje del usuario
            const userMessage = {
                message: messageText,
                sender: "user",
                direction: "outgoing"
            };
            setMessages(prevMessages => [...prevMessages, userMessage]);
            setIsLoading(true);

            // Llamar al API
            const response = await axios.post('http://localhost:8000/api/chat', {
                text: messageText
            }, {
                timeout: 30000 // 30 segundos de timeout
            });

            // Agregar respuesta del bot
            if (response.data && response.data.response) {
                const botMessage = {
                    message: response.data.response,
                    sender: "bot",
                    direction: "incoming"
                };
                setMessages(prevMessages => [...prevMessages, botMessage]);
            }
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = {
                message: error.response?.status === 429 
                    ? "Estoy recibiendo demasiadas preguntas en este momento. Por favor, espera un momento y vuelve a intentar."
                    : "Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta de nuevo.",
                sender: "bot",
                direction: "incoming"
            };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{
            message: "¡Hola! Soy tu asistente virtual para consultas sobre proyectos de ley. ¿En qué puedo ayudarte?",
            sender: "bot",
            direction: "incoming"
        }]);
    };

    return (
        <>
            {!isOpen && (
                <button className="chat-widget-button" onClick={toggleChat}>
                    <img src={logoLegislatura} alt="Logo Legislatura" className="chat-widget-logo" />
                    <span className="chat-widget-button-text">¿Necesitas ayuda?</span>
                </button>
            )}
            
            {isOpen && (
                <div className="chat-widget-container">
                    <div className="chat-header">
                        <div className="header-content">
                            <img src={logoLegislatura} alt="Logo Legislatura" className="header-logo" />
                            <div className="header-text">
                                <h3>Asistente Virtual</h3>
                                <div className="header-subtitle">Cámara de Diputados</div>
                            </div>
                        </div>
                        <div className="chat-header-actions">
                            <button onClick={clearChat} className="action-button">
                                <i className="fas fa-trash"></i>
                            </button>
                            <button onClick={toggleChat} className="close-button">
                                ×
                            </button>
                        </div>
                    </div>
                    <ChatContainer>
                        <MessageList
                            typingIndicator={isLoading ? <TypingIndicator content="El bot está escribiendo..." /> : null}
                        >
                            {messages.map((m, i) => (
                                <Message 
                                    key={i}
                                    model={{
                                        message: m.message,
                                        sentTime: "just now",
                                        sender: m.sender,
                                        direction: m.direction,
                                        position: "normal"
                                    }}
                                    className={m.sender === "bot" ? "bot-message" : "user-message"}
                                />
                            ))}
                        </MessageList>
                        <MessageInput 
                            placeholder="Escribe tu pregunta sobre las leyes aquí..." 
                            onSend={handleSend}
                            attachButton={false}
                        />
                    </ChatContainer>
                </div>
            )}
        </>
    );
};

// Exportación por defecto
export default ChatWidget; 