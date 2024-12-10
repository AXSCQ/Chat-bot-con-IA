import fs from 'fs-extra';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), 'cache_data.json');

async function initCache() {
    try {
        if (!await fs.pathExists(CACHE_FILE)) {
            await fs.writeJson(CACHE_FILE, {}, { spaces: 2 });
            console.log('Cache inicializado correctamente');
        }
    } catch (error) {
        console.error('Error inicializando caché:', error);
        await fs.writeJson(CACHE_FILE, {}, { spaces: 2 });
    }
}

async function savePDFCache(pdfName, content) {
    try {
        await initCache();
        const cache = await fs.readJson(CACHE_FILE);
        
        cache[pdfName] = {
            content: content.toString(),
            timestamp: new Date().toISOString()
        };
        
        await fs.writeJson(CACHE_FILE, cache, { spaces: 2 });
        console.log(`✅ Cache actualizado para ${pdfName}`);
    } catch (error) {
        console.error('Error al guardar cache:', error);
    }
}

async function getPDFCache(pdfName) {
    try {
        await initCache();
        const cache = await fs.readJson(CACHE_FILE);
        return cache[pdfName] || null;
    } catch (error) {
        console.error('Error al leer cache:', error);
        return null;
    }
}

async function getAllPDFCache() {
    try {
        await initCache();
        const cache = await fs.readJson(CACHE_FILE);
        return Object.entries(cache)
            .map(([name, data]) => `[${name}]\n${data.content}`)
            .join('\n\n');
    } catch (error) {
        console.error('Error al leer todo el cache:', error);
        return '';
    }
}

initCache().catch(console.error);

export { savePDFCache, getPDFCache, getAllPDFCache }; 