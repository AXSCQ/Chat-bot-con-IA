import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db;

async function initializeDatabase() {
    try {
        db = await open({
            filename: path.join(process.cwd(), 'users.db'),
            driver: sqlite3.Database
        });

        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Base de datos inicializada correctamente');
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
    }
}

async function registerUser(name, email) {
    try {
        const result = await db.run(
            'INSERT INTO users (name, email) VALUES (?, ?)',
            [name, email]
        );
        return { success: true, id: result.lastID };
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        return { success: false, error: error.message };
    }
}

async function getAllUsers() {
    try {
        const users = await db.all('SELECT * FROM users ORDER BY created_at DESC');
        return users;
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return [];
    }
}

export { initializeDatabase, registerUser, getAllUsers }; 