# Usar una imagen base de Node.js
FROM node:20-slim

# Instalar dependencias necesarias
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-spa \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    curl \
    libpng-dev \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de la aplicación
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --build-from-source

# Copiar el resto de los archivos
COPY . .

# Crear directorios necesarios y establecer permisos
RUN mkdir -p PDF temp && \
    chmod -R 777 PDF temp

# Exponer el puerto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["npm", "run", "dev"] 