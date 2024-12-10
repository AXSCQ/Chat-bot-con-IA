import { extractImagesFromPDF } from './pdfProcessor.js';
import path from 'path';

async function testScan() {
    try {
        const pdfPath = path.join(process.cwd(), 'PDF', 'test.pdf');
        console.log('Iniciando escaneo de:', pdfPath);
        
        const text = await extractImagesFromPDF(pdfPath);
        console.log('Texto extraído:', text);
    } catch (error) {
        console.error('Error en el escaneo:', error);
    }
}

testScan(); 