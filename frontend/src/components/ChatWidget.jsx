import React, { useState } from 'react';
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

// Componente ChatWidget
const ChatWidget = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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
                message: "Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta de nuevo.",
                sender: "bot",
                direction: "incoming"
            };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: "relative", height: "500px", width: "100%" }}>
            <MainContainer>
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
                            />
                        ))}
                    </MessageList>
                    <MessageInput 
                        placeholder="Escribe tu pregunta sobre las leyes aquí..." 
                        onSend={handleSend}
                        attachButton={false}
                    />
                </ChatContainer>
            </MainContainer>
        </div>
    );
};

// Exportación por defecto
export default ChatWidget; 