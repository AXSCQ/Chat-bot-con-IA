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

// Constantes para la API
const API_BASE_URL = 'http://localhost:8000';
const ENDPOINTS = {
    chat: `${API_BASE_URL}/api/chat`,
    laws: `${API_BASE_URL}/api/laws`
};

// Componente ChatWidget
const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingLaws, setIsLoadingLaws] = useState(false);
    const [user, setUser] = useState(null);
    const [laws, setLaws] = useState([]);
    const [selectedLaws, setSelectedLaws] = useState([]);
    const [showRegister, setShowRegister] = useState(true);
    const [registerData, setRegisterData] = useState({ name: '', email: '' });

    useEffect(() => {
        fetchLaws();
    }, []);

    const fetchLaws = async () => {
        setIsLoadingLaws(true);
        try {
            // Primero verificamos si el endpoint está disponible
            const response = await axios.get(ENDPOINTS.laws);
            const lawsData = response.data.laws || response.data || [];
            setLaws(Array.isArray(lawsData) ? lawsData : []);
        } catch (error) {
            console.error('Error fetching laws:', error);
            setLaws([]);
            // Mostrar un mensaje más amigable al usuario
            setMessages(prev => [...prev, {
                message: "En este momento no puedo cargar los proyectos de ley. Por favor, intenta más tarde.",
                sender: "bot",
                direction: "incoming"
            }]);
        } finally {
            setIsLoadingLaws(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // Primero intentamos registrar al usuario
            const response = await axios.post('http://localhost:8000/api/register', registerData);
            const userData = response.data.user || response.data;
            setUser(userData);
            setShowRegister(false);
            
            setMessages([{
                message: "¡Hola! Soy tu asistente virtual. En un momento cargaré los proyectos de ley disponibles.",
                sender: "bot",
                direction: "incoming"
            }]);

            // Luego intentamos cargar los proyectos
            await fetchLaws();
            
        } catch (error) {
            console.error('Error:', error);
            
            // Mensaje de error específico según el tipo de error
            let errorMessage = "Hubo un error al registrarse. Por favor, intenta nuevamente.";
            
            if (error.response) {
                // El servidor respondió con un estado de error
                if (error.response.status === 404) {
                    errorMessage = "El servicio de registro no está disponible en este momento.";
                } else if (error.response.status === 400) {
                    errorMessage = "Por favor, verifica los datos ingresados.";
                }
            } else if (error.request) {
                // La petición fue hecha pero no se recibió respuesta
                errorMessage = "No se pudo conectar con el servidor. Por favor, verifica tu conexión.";
            }
            
            alert(errorMessage);
        }
    };

    // Función para extraer el número de ley del formato completo
    const extractLawNumber = (lawString) => {
        // Asumiendo que el formato es "PL No 307/2024-2025"
        const match = lawString.match(/\d+/);
        return match ? match[0] : '';
    };

    const handleLawSelection = (lawNumber) => {
        setSelectedLaws(prev => {
            const normalizedNumber = extractLawNumber(lawNumber);
            if (prev.includes(normalizedNumber)) {
                return prev.filter(id => id !== normalizedNumber);
            }
            if (prev.length < 3) {
                return [...prev, normalizedNumber];
            }
            return prev;
        });
    };

    const handleSend = async (messageText) => {
        if (!user || selectedLaws.length === 0) {
            setMessages(prev => [...prev, {
                message: "Por favor, selecciona al menos un proyecto de ley para consultar.",
                sender: "bot",
                direction: "incoming"
            }]);
            return;
        }

        try {
            // Agregar mensaje del usuario al chat
            const userMessage = {
                message: messageText,
                sender: "user",
                direction: "outgoing"
            };
            setMessages(prev => [...prev, userMessage]);
            setIsLoading(true);

            // Preparar la solicitud según el formato especificado
            const chatRequest = {
                text: messageText,
                selected_pdfs: selectedLaws // Ya tenemos los números extraídos
            };

            const response = await fetch(ENDPOINTS.chat, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chatRequest)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "success") {
                const botMessage = {
                    message: data.response,
                    sender: "bot",
                    direction: "incoming"
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                throw new Error('Respuesta no exitosa del servidor');
            }
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = {
                message: "Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta de nuevo.",
                sender: "bot",
                direction: "incoming"
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
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

                    {showRegister ? (
                        <div className="register-container">
                            <h3>Registro de Usuario</h3>
                            <form onSubmit={handleRegister}>
                                <input
                                    type="text"
                                    placeholder="Nombre completo"
                                    value={registerData.name}
                                    onChange={e => setRegisterData({...registerData, name: e.target.value})}
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Correo electrónico"
                                    value={registerData.email}
                                    onChange={e => setRegisterData({...registerData, email: e.target.value})}
                                    required
                                />
                                <button type="submit">Registrarse</button>
                            </form>
                        </div>
                    ) : (
                        <div className="chat-content">
                            <div className="laws-selector">
                                <h4>Proyectos de Ley ({selectedLaws.length}/3 seleccionados)</h4>
                                {isLoadingLaws ? (
                                    <div className="laws-loading">
                                        <i className="fas fa-spinner fa-spin"></i> Cargando proyectos...
                                    </div>
                                ) : laws.length > 0 ? (
                                    <div className="laws-list">
                                        {laws.map(law => (
                                            <div 
                                                key={law.number}
                                                className={`law-item ${selectedLaws.includes(extractLawNumber(law.number)) ? 'selected' : ''}`}
                                                onClick={() => handleLawSelection(law.number)}
                                            >
                                                <div className="law-info">
                                                    <span className="law-number">PL No {law.number}</span>
                                                    <span className="law-title">{law.title}</span>
                                                    {law.description && (
                                                        <span className="law-description">{law.description}</span>
                                                    )}
                                                </div>
                                                {law.pdfUrl && (
                                                    <a 
                                                        href={law.pdfUrl} 
                                                        className="download-button"
                                                        onClick={e => e.stopPropagation()}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <i className="fas fa-download"></i>
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="laws-empty-state">
                                        No hay proyectos de ley disponibles en este momento.
                                        <button 
                                            onClick={fetchLaws} 
                                            className="retry-button"
                                        >
                                            <i className="fas fa-sync-alt"></i> Reintentar
                                        </button>
                                    </div>
                                )}
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
                                    placeholder={selectedLaws.length === 0 
                                        ? "Selecciona al menos un proyecto de ley para comenzar..." 
                                        : "Escribe tu pregunta aquí..."
                                    }
                                    onSend={handleSend}
                                    attachButton={false}
                                    disabled={selectedLaws.length === 0}
                                />
                            </ChatContainer>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

// Exportación por defecto
export default ChatWidget; 