import fs from 'fs-extra';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), 'response_cache.json');

async function findSimilarQuestion(question) {
    try {
        if (await fs.pathExists(CACHE_FILE)) {
            const cache = await fs.readJson(CACHE_FILE);
            // Buscar preguntas similares usando comparación simple
            const similarityThreshold = 0.8;
            
            for (const entry of cache) {
                if (calculateSimilarity(question, entry.question) > similarityThreshold) {
                    console.log('Usando respuesta cacheada');
                    return entry.answer;
                }
            }
        }
        return null;
    } catch (error) {
        console.error('Error al buscar en caché:', error);
        return null;
    }
}

async function cacheResponse(question, answer) {
    try {
        let cache = [];
        if (await fs.pathExists(CACHE_FILE)) {
            cache = await fs.readJson(CACHE_FILE);
        }
        
        cache.push({
            question,
            answer,
            timestamp: new Date().toISOString()
        });
        
        await fs.writeJson(CACHE_FILE, cache, { spaces: 2 });
    } catch (error) {
        console.error('Error al cachear respuesta:', error);
    }
} 