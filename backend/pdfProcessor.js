import OpenAI from 'openai';
import fs from 'fs-extra';
import path from 'path';
import Tesseract from 'tesseract.js';
import { savePDFCache, getPDFCache } from './pdfCache.js';
import 'dotenv/config';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function processWithTesseract(pdfPath) {
    try {
        console.log('🔍 Iniciando OCR...');
        const result = await Tesseract.recognize(
            pdfPath,
            'spa',
            {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        process.stdout.write('.');
                    } else {
                        console.log(`OCR: ${m.status}`);
                    }
                }
            }
        );
        
        return result.data.text;
    } catch (error) {
        console.error('Error en OCR:', error);
        return '';
    }
}

async function extractImagesFromPDF(pdfPath) {
    const pdfName = path.basename(pdfPath);
    
    try {
        // Verificar caché primero
        const cachedContent = await getPDFCache(pdfName);
        if (cachedContent) {
            console.log(`✅ Usando contenido cacheado para ${pdfName}`);
            return cachedContent.content;
        }

        console.log(`📑 Procesando PDF: ${pdfName}`);
        
        // Intentar OCR directamente
        const extractedText = await processWithTesseract(pdfPath);
        
        if (extractedText && extractedText.trim()) {
            console.log('✅ OCR completado exitosamente');
            await savePDFCache(pdfName, extractedText);
            return extractedText;
        } else {
            console.log('❌ No se pudo extraer texto del PDF');
            return '';
        }
    } catch (error) {
        console.error(`❌ Error procesando PDF ${pdfName}:`, error);
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
                console.log(`\nProcesando archivo: ${file}`);
                const filePath = path.join(pdfFolder, file);
                const text = await extractImagesFromPDF(filePath);
                if (text.trim()) {
                    allText += `[Documento: ${file}]\n${text}\n\n`;
                }
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
                    content: `Eres un asistente legislativo especializado que ayuda a los diputados 
                    de la Cámara de Diputados. Tu función es analizar y responder preguntas sobre 
                    documentos legislativos, proyectos de ley y otros documentos parlamentarios.`
                },
                {
                    role: "user",
                    content: `Contexto del documento:\n${context}\n\nConsulta: ${question}`
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
        if (!pdfContext) {
            return "No hay contenido de PDFs disponible.";
        }
        const answer = await answerQuestion(question, pdfContext);
        return answer;
    } catch (error) {
        console.error('Error al procesar la pregunta:', error);
        throw error;
    }
}

export { readAllPDFs, handleQuestion, answerQuestion, extractImagesFromPDF };