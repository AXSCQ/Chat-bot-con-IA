# Chat-bot con IA - Cámara de Diputados

## Descripción

Chatbot especializado en documentos legales de la Cámara de Diputados de Bolivia que permite a los usuarios consultar información sobre proyectos de ley mediante inteligencia artificial.

## Características principales

- **Interfaz de usuario intuitiva**: Chat en tiempo real con diseño responsive y amigable
- **Selección de documentos**: Permite seleccionar hasta 3 proyectos de ley para consultas
- **Búsqueda de proyectos**: Filtrado por número, título o descripción
- **Descarga de PDFs**: Acceso directo a los documentos originales
- **Registro de usuario**: Sistema de registro simple para monitorear el uso
- **Respuestas contextuales**: IA entrenada en documentos legales

## Tecnologías utilizadas

### Frontend
- React
- Vite
- @chatscope/chat-ui-kit
- Axios
- CSS personalizado

### Backend
- FastAPI
- OpenAI API
- PostgreSQL
- DocLing (procesamiento de documentos)
- SQLAlchemy

## Instalación y ejecución

### Requisitos previos
- Node.js (v14 o superior)
- Docker y Docker Compose
- API key de OpenAI

### Ejecución con Docker Compose

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/Chat-bot-con-IA.git
cd Chat-bot-con-IA
```

2. Configurar la clave API de OpenAI:
```bash
export OPENAI_API_KEY=tu_clave_api
```

3. Iniciar los servicios:
```bash
docker-compose up --build
```

4. Acceder a la aplicación:
   - Frontend: http://localhost:80
   - API Backend: http://localhost:8000

### Ejecución en desarrollo (local)

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Uso

1. Regístrate con tu nombre y correo
2. Selecciona hasta 3 proyectos de ley para consultar
3. Realiza preguntas específicas sobre los proyectos
4. Descarga los PDFs si necesitas consultar la fuente original

## Estructura del proyecto

```
/
├── frontend/              # Aplicación React
│   ├── src/               # Código fuente
│   │   ├── components/    # Componentes React
│   │   ├── assets/        # Recursos estáticos
│   │   └── ...            # Otros archivos JS/JSX
│   ├── public/            # Archivos públicos
│   ├── Dockerfile         # Configuración de Docker para frontend
│   └── ...                # Archivos de configuración
│
└── backend/               # API FastAPI
    ├── src/               # Código fuente
    │   ├── chatbot.py     # Integración con OpenAI
    │   ├── config.py      # Configuración
    │   ├── models.py      # Modelos de datos
    │   └── ...            # Otros módulos
    ├── Dockerfile         # Configuración de Docker para backend
    └── ...                # Archivos de configuración
```

## Contribución

Si deseas contribuir al proyecto, por favor:

1. Haz un fork del repositorio
2. Crea una nueva rama para tu funcionalidad
3. Realiza tus cambios
4. Envía un pull request

## Licencia

Este proyecto está licenciado bajo [Licencia Específica]

## Contacto

Para más información o consultas, contactar a:
- [tu-correo@ejemplo.com] 