import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { readAllPDFs, handleQuestion } from './pdfProcessor.js';
import 'dotenv/config';
import fs from 'fs-extra';

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/chat', async (req, res) => {
    try {
        const { question } = req.body;
        console.log('Pregunta recibida:', question);

        // Verificar si hay PDFs
        const pdfFiles = await fs.readdir('./PDF');
        console.log('PDFs encontrados:', pdfFiles);

        if (pdfFiles.length === 0) {
            return res.json({ 
                answer: "No hay PDFs en la carpeta. Por favor, agrega algunos documentos PDF para poder responder preguntas."
            });
        }

        const response = await handleQuestion(question);
        console.log('Respuesta generada:', response);
        
        res.json({ answer: response });
    } catch (error) {
        console.error('Error en /api/chat:', error);
        res.status(500).json({ 
            error: error.message,
            answer: "Hubo un error al procesar tu pregunta. Por favor, verifica que los PDFs sean legibles."
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log('Directorio de PDFs:', process.cwd() + '/PDF');
});