import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { readAllPDFs, handleQuestion, answerQuestion, extractImagesFromPDF } from './pdfProcessor.js';
import 'dotenv/config';
import fs from 'fs-extra';
import { initializeDatabase, registerUser, getAllUsers } from './database.js';
import chokidar from 'chokidar';
import path from 'path';
import { getAllPDFCache } from './pdfCache.js';
import dotenv from 'dotenv';
import { fetchAndDownloadPDFs } from './pdfDownloader.js';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Inicializar la base de datos
await initializeDatabase();

// Configurar el watcher de PDFs
const pdfWatcher = chokidar.watch('./PDF', {
    ignored: /(^|[\/\\])\../,
    persistent: true
});

let pdfContent = '';

pdfWatcher.on('add', async (filePath) => {
    console.log(`Nuevo PDF detectado: ${filePath}`);
    try {
        // Procesar solo el nuevo archivo
        await extractImagesFromPDF(filePath);
        console.log('PDF procesado y cacheado correctamente');
    } catch (error) {
        console.error('Error al procesar nuevo PDF:', error);
    }
});

pdfWatcher.on('unlink', async (filePath) => {
    const pdfName = path.basename(filePath);
    try {
        // Eliminar del caché cuando se elimina un archivo
        let cache = {};
        if (await fs.pathExists('pdf_cache.json')) {
            cache = await fs.readJson('pdf_cache.json');
            delete cache[pdfName];
            await fs.writeJson('pdf_cache.json', cache, { spaces: 2 });
        }
        console.log(`Cache eliminado para ${pdfName}`);
    } catch (error) {
        console.error('Error al eliminar cache:', error);
    }
});

// Función para descargar y escanear PDFs automáticamente
async function updatePDFs() {
    try {
        console.log('Iniciando descarga de PDFs...');
        await fetchAndDownloadPDFs();
        console.log('Descarga de PDFs completada');
    } catch (error) {
        console.error('Error al actualizar PDFs:', error);
    }
}

// Llamar a la función de actualización al iniciar el servidor
updatePDFs();

app.post('/api/chat', async (req, res) => {
    try {
        const { question } = req.body;
        console.log('Pregunta recibida:', question);

        // Usar el contenido cacheado
        const pdfContent = await getAllPDFCache();
        
        if (!pdfContent) {
            return res.json({ 
                answer: "No hay contenido de PDFs disponible. Por favor, agrega algunos documentos PDF."
            });
        }

        const response = await answerQuestion(question, pdfContent);
        console.log('Respuesta generada:', response);
        
        res.json({ answer: response });
    } catch (error) {
        console.error('Error en /api/chat:', error);
        res.status(500).json({ 
            error: error.message,
            answer: "Hubo un error al procesar tu pregunta."
        });
    }
});

// Nuevas rutas para usuarios
app.post('/api/register', async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: 'Nombre y email son requeridos' });
        }
        
        const result = await registerUser(name, email);
        if (result.success) {
            res.json({ success: true, id: result.id });
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Agregar endpoint de health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log('Directorio de PDFs:', process.cwd() + '/PDF');
});