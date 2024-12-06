import { useState } from 'react';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import axios from 'axios';
import './ChatWidget.css';

function ChatWidget() {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    
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

            const response = await axios.post('http://localhost:3001/api/chat', {
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
                    <span className="chat-widget-button-icon">💬</span>
                    <span className="chat-widget-button-text">Asistente PDF</span>
                </button>
            )}
            
            {isOpen && (
                <div className="chat-widget-container">
                    <div className="chat-header">
                        <h3>Asistente PDF</h3>
                        <div className="chat-header-actions">
                            <span className="status-indicator">En línea</span>
                            <button className="close-button" onClick={toggleChat}>×</button>
                        </div>
                    </div>
                    <MainContainer>
                        <ChatContainer>
                            <MessageList>
                                {messages.length === 0 && (
                                    <div className="welcome-message">
                                        <h4>👋 ¡Bienvenido!</h4>
                                        <p>Puedes preguntarme cualquier cosa sobre los documentos PDF cargados.</p>
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
                                placeholder="Escribe tu pregunta aquí..." 
                                onSend={handleSend}
                                attachButton={false}
                                className="custom-message-input"
                            />
                        </ChatContainer>
                    </MainContainer>
                </div>
            )}
        </>
    );
}

export default ChatWidget; 