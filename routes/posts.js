const express = require('express')
const router = express.Router()
const db = require('../config/db')

// Crear post (sin validación ni sanitización, ni auth)
router.post('/api/posts', async (req, res) => {
    const { title, description, body, id_user } = req.body;
    const createdAt = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const query = `
        INSERT INTO posts (title, description, body, createdAt, id_user)
        VALUES ('${title}', '${description}', '${body}', '${createdAt}', ${id_user})
    `;

    try {
        const result = await db.execute(query);
        res.status(201).json({
            message: 'Post creado',
            postId: Number(result.insertId),
            createdAt
        });
    } catch (err) {
        res.status(500).json({ error: err.message, query });
    }
});

// Leer todos los posts (sin filtro, incluye borrados)
router.get('/api/posts', async (req, res) => {
    try {
        const posts = await db.execute('SELECT * FROM posts');
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Leer un post por ID (vulnerable a SQLi)
router.get('/api/posts/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const post = await db.execute(`SELECT * FROM posts WHERE id = ${id}`);
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar post (sin verificar existencia, sin auth, sin sanitizar)
router.put('/api/posts/:id', async (req, res) => {
    const id = req.params.id;
    const { title, description, body } = req.body;

    const query = `
        UPDATE posts
        SET title = '${title}', description = '${description}', body = '${body}'
        WHERE id = ${id}
    `;

    try {
        const result = await db.execute(query);
        res.json({ message: 'Post actualizado', affectedRows: result.affectedRows });
    } catch (err) {
        res.status(500).json({ error: err.message, query });
    }
});

// Eliminar post (DELETE físico, sin auth, sin CSRF, sin verificar ownership)
router.delete('/api/posts/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const result = await db.execute(`DELETE FROM posts WHERE id = ${id}`);
        res.json({ message: 'Post eliminado', affectedRows: result.affectedRows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router
