import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

const API_BASE_URL = 'https://diputados.gob.bo/wp-json/wp/v2/ley';
const PDF_DIR = path.join(process.cwd(), 'PDF');

async function downloadPDF(url, filename) {
    try {
        console.log(`⬇️ Descargando ${filename}...`);
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(path.join(PDF_DIR, filename));
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`✅ PDF descargado: ${filename}`);
                resolve();
            });
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`❌ Error descargando PDF ${filename}:`, error.message);
        throw error;
    }
}

async function cleanupOldPDFs(currentPDFs) {
    try {
        const existingFiles = await fs.readdir(PDF_DIR);
        for (const file of existingFiles) {
            if (file.endsWith('.pdf') && !currentPDFs.includes(file)) {
                console.log(`🗑️ Eliminando PDF obsoleto: ${file}`);
                await fs.remove(path.join(PDF_DIR, file));
            }
        }
    } catch (error) {
        console.error('Error al limpiar PDFs antiguos:', error);
    }
}

async function fetchAndDownloadPDFs() {
    try {
        // Asegurar que el directorio PDF existe
        await fs.ensureDir(PDF_DIR);
        
        console.log('📂 Obteniendo lista de proyectos de ley...');
        const response = await axios.get(`${API_BASE_URL}?estado_de_ley=7&page=1&per_page=100&acf_format=standard`);
        
        console.log(`📊 Encontrados ${response.data.length} proyectos de ley`);
        
        const currentPDFs = [];
        let downloadCount = 0;

        for (const ley of response.data) {
            if (ley.acf && ley.acf.archivo_ley) {
                const pdfUrl = ley.acf.archivo_ley;
                const filename = `PL-${ley.acf.ley_nro.replace(/\//g, '-')}.pdf`;
                currentPDFs.push(filename);

                // Verificar si el PDF ya existe
                if (!await fs.pathExists(path.join(PDF_DIR, filename))) {
                    await downloadPDF(pdfUrl, filename);
                    downloadCount++;
                } else {
                    console.log(`⏩ PDF ${filename} ya existe, saltando...`);
                }
            }
        }

        // Limpiar PDFs antiguos
        await cleanupOldPDFs(currentPDFs);

        console.log(`✨ Proceso completado: ${downloadCount} PDFs nuevos descargados`);
        return true;
    } catch (error) {
        console.error('❌ Error en fetchAndDownloadPDFs:', error);
        throw error;
    }
}

export { fetchAndDownloadPDFs };