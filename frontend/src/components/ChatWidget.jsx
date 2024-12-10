import { useState, useEffect } from 'react';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import axios from 'axios';
import './ChatWidget.css';
import logoLegislatura from '../assets/logo-legislatura.png';
import ReactDOM from 'react-dom/client';

function ChatWidget({ apiUrl, theme }) {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [registrationData, setRegistrationData] = useState({
        name: '',
        email: ''
    });
    
    const handleRegistration = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${apiUrl}/api/register`, registrationData);
            if (response.data.success) {
                setIsRegistered(true);
                localStorage.setItem('chatUserRegistered', 'true');
            }
        } catch (error) {
            console.error('Error en registro:', error);
            alert('Error al registrar. Por favor intenta de nuevo.');
        }
    };

    useEffect(() => {
        const isUserRegistered = localStorage.getItem('chatUserRegistered');
        if (isUserRegistered) {
            setIsRegistered(true);
        }
    }, []);

    const handleSend = async (messageText) => {
        try {
            setIsLoading(true);
            
            // Eliminar cualquier formato HTML del mensaje
            const cleanMessage = messageText.replace(/<[^>]*>/g, '');
            
            setMessages(prevMessages => [...prevMessages, {
                message: cleanMessage,
                sender: "user",
                direction: "outgoing"
            }]);

            const response = await axios.post(`${apiUrl}/api/chat`, {
                question: cleanMessage
            });

            if (response.data && response.data.answer) {
                setMessages(prevMessages => [...prevMessages, {
                    message: response.data.answer,
                    sender: "bot",
                    direction: "incoming"
                }]);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prevMessages => [...prevMessages, {
                message: "Error al procesar tu pregunta. Por favor, intenta de nuevo.",
                sender: "bot",
                direction: "incoming"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {!isOpen && (
                <button className="chat-widget-button" onClick={toggleChat}>
                    <img src={logoLegislatura} alt="Logo Legislatura" className="chat-widget-logo" />
                    <span className="chat-widget-button-text">Asistente Legislativo</span>
                </button>
            )}
            
            {isOpen && (
                <div className="chat-widget-container">
                    <div className="chat-header">
                        <div className="header-content">
                            <img src={logoLegislatura} alt="Logo Legislatura" className="header-logo" />
                            <div className="header-text">
                                <h3>Cámara de Diputados</h3>
                                <span className="header-subtitle">Legislatura del Bicentenario 2024-2025</span>
                            </div>
                        </div>
                        <div className="chat-header-actions">
                            <span className="status-indicator">En línea</span>
                            <button className="close-button" onClick={toggleChat}>×</button>
                        </div>
                    </div>
                    
                    {!isRegistered ? (
                        <div className="registration-form">
                            <h4>Registro de Usuario</h4>
                            <p className="registration-info">
                                Este asistente está diseñado para apoyar la labor legislativa, 
                                facilitando el acceso y análisis de documentos parlamentarios.
                            </p>
                            <form onSubmit={handleRegistration}>
                                <input
                                    type="text"
                                    placeholder="Nombre"
                                    value={registrationData.name}
                                    onChange={(e) => setRegistrationData({
                                        ...registrationData,
                                        name: e.target.value
                                    })}
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Correo electrónico"
                                    value={registrationData.email}
                                    onChange={(e) => setRegistrationData({
                                        ...registrationData,
                                        email: e.target.value
                                    })}
                                    required
                                />
                                <button type="submit">Registrarse</button>
                            </form>
                        </div>
                    ) : (
                        <MainContainer>
                            <ChatContainer>
                                <MessageList>
                                    {messages.length === 0 && (
                                        <div className="welcome-message">
                                            <h4>👋 Bienvenido al Asistente Legislativo</h4>
                                            <p>Este asistente está diseñado para:</p>
                                            <ul>
                                                <li>Analizar documentos legislativos</li>
                                                <li>Responder consultas sobre proyectos de ley</li>
                                                <li>Facilitar el acceso a información parlamentaria</li>
                                                <li>Apoyar en la labor legislativa diaria</li>
                                            </ul>
                                            <p>¿En qué puedo ayudarte hoy?</p>
                                        </div>
                                    )}
                                    {messages.map((m, i) => (
                                        <Message 
                                            key={i} 
                                            model={m}
                                            className={m.sender === "bot" ? "bot-message" : "user-message"}
                                        />
                                    ))}
                                    {isLoading && (
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    )}
                                </MessageList>
                                <MessageInput 
                                    placeholder="Realiza tu consulta legislativa aquí..." 
                                    onSend={handleSend}
                                    attachButton={false}
                                    className="custom-message-input"
                                />
                            </ChatContainer>
                        </MainContainer>
                    )}
                </div>
            )}
        </>
    );
}

// Exportar como un widget que puede ser montado en cualquier div
export function initChatWidget(containerId, config = {}) {
    const container = document.getElementById(containerId);
    if (container) {
        ReactDOM.createRoot(container).render(
            <ChatWidget 
                apiUrl={config.apiUrl || 'http://localhost:3001'} 
                theme={config.theme || {}}
            />
        );
    }
}

// Exportar también el componente para uso directo
export default ChatWidget; 