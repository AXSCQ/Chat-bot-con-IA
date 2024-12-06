import OpenAI from 'openai';
import fs from 'fs-extra';
import { createRequire } from 'module';
import Tesseract from 'tesseract.js';
import path from 'path';
const require = createRequire(import.meta.url);
const pdfjsLib = require('pdfjs-dist');
import 'dotenv/config';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function extractImagesFromPDF(pdfPath) {
    try {
        const data = new Uint8Array(await fs.readFile(pdfPath));
        const loadingTask = pdfjsLib.getDocument(data);
        const pdf = await loadingTask.promise;
        let extractedText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            
            // Crear un canvas temporal
            const canvas = new require('canvas').createCanvas(viewport.width, viewport.height);
            const context = canvas.getContext('2d');
            
            // Renderizar la página en el canvas
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            // Guardar la imagen temporalmente
            const tempImagePath = path.join(process.cwd(), 'temp', `page-${i}.png`);
            await fs.ensureDir(path.join(process.cwd(), 'temp'));
            const out = fs.createWriteStream(tempImagePath);
            const stream = canvas.createPNGStream();
            await new Promise((resolve, reject) => {
                stream.pipe(out);
                out.on('finish', resolve);
                out.on('error', reject);
            });

            // Procesar la imagen con Tesseract
            console.log(`Procesando página ${i} con OCR...`);
            const result = await Tesseract.recognize(
                tempImagePath,
                'spa',
                {
                    logger: m => console.log(`OCR Progreso: ${m.status}`)
                }
            );
            extractedText += result.data.text + '\n';

            // Limpiar archivo temporal
            await fs.remove(tempImagePath);
        }

        return extractedText;
    } catch (error) {
        console.error('Error al procesar el PDF:', error);
        return '';
    }
}

async function readAllPDFs() {
    const pdfFolder = './PDF';
    let allText = '';
    try {
        const files = await fs.readdir(pdfFolder);
        for (const file of files) {
            if (file.endsWith('.pdf')) {
                console.log(`Procesando archivo: ${file}`);
                const filePath = path.join(pdfFolder, file);
                const text = await extractImagesFromPDF(filePath);
                allText += `[Documento: ${file}] ${text}\n\n`;
            }
        }
        return allText;
    } catch (error) {
        console.error('Error al leer los PDFs:', error);
        return '';
    }
}

async function answerQuestion(question, context) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Eres un asistente que responde preguntas basadas en el contenido de documentos PDF. Si no puedes encontrar la información específica en el contexto proporcionado, indícalo claramente."
                },
                {
                    role: "user",
                    content: `Contexto del PDF:\n${context}\n\nPregunta: ${question}`
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error al procesar la pregunta con OpenAI:', error);
        throw error;
    }
}

async function handleQuestion(question) {
    try {
        const pdfContext = await readAllPDFs();
        if (!pdfContext || pdfContext.trim().length === 0) {
            return "No pude extraer información de los documentos PDF. Por favor, verifica que los archivos sean accesibles y contengan texto.";
        }

        console.log('Contenido extraído del PDF:', pdfContext.substring(0, 200) + '...');
        const answer = await answerQuestion(question, pdfContext);
        return answer;
    } catch (error) {
        console.error('Error al procesar la pregunta:', error);
        throw error;
    }
}

export { readAllPDFs, handleQuestion };