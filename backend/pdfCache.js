import fs from 'fs-extra';
import path from 'path';

const CACHE_FILE = 'pdf_cache.json';

async function savePDFCache(pdfName, content) {
    try {
        let cache = {};
        if (await fs.pathExists(CACHE_FILE)) {
            cache = await fs.readJson(CACHE_FILE);
        }
        
        cache[pdfName] = {
            content,
            timestamp: new Date().toISOString()
        };
        
        await fs.writeJson(CACHE_FILE, cache, { spaces: 2 });
        console.log(`Cache actualizado para ${pdfName}`);
    } catch (error) {
        console.error('Error al guardar cache:', error);
    }
}

async function getPDFCache(pdfName) {
    try {
        if (await fs.pathExists(CACHE_FILE)) {
            const cache = await fs.readJson(CACHE_FILE);
            return cache[pdfName];
        }
        return null;
    } catch (error) {
        console.error('Error al leer cache:', error);
        return null;
    }
}

async function getAllPDFCache() {
    try {
        if (await fs.pathExists(CACHE_FILE)) {
            const cache = await fs.readJson(CACHE_FILE);
            return Object.values(cache).map(item => item.content).join('\n\n');
        }
        return '';
    } catch (error) {
        console.error('Error al leer todo el cache:', error);
        return '';
    }
}

export { savePDFCache, getPDFCache, getAllPDFCache }; 