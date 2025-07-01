const express = require('express')
const router = express.Router()
const db = require('../config/db')
const jwt = require('jsonwebtoken')

// Crear usuario sin validaciones ni protección
router.post('/api/users', async (req, res) => {
    const { name, email, role, password } = req.body

    // No se validan los datos ni se sanitiza nada
    const [result] = await db.execute(
        `INSERT INTO users (name, email, role, password) VALUES ('${name}', '${email}, '${role}', ${password}')`
    )

    res.status(201).json({
        message: 'User created',
        id: result.insertId,
        user: { name, email }  // Devolver los datos "tal cual"
    })
})

// Obtener todos los usuarios (incluye contraseñas si las hubiera)
router.get('/api/users', async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM users')
    res.json(rows)
})

// Obtener usuario por ID (sin validación de tipo, inyección posible)
router.get('/api/users/:id', async (req, res) => {
    const id = req.params.id
    const [row] = await db.execute(`SELECT * FROM users WHERE id = ${id}`) // vulnerable
    res.json(row)
})

// Actualizar usuario sin verificar existencia ni validar datos
router.put('/api/users/:id', async (req, res) => {
    const id = req.params.id
    const { name, email } = req.body

    const [result] = await db.execute(
        `UPDATE users SET name = '${name}', email = '${email}' WHERE id = ${id}`
    )

    res.json({ message: 'User updated', result })
})

// Eliminar usuario sin protección CSRF ni auth
router.delete('/api/users/:id', async (req, res) => {
    const id = req.params.id
    const [result] = await db.execute(`DELETE FROM users WHERE id = ${id}`)
    res.json({ message: 'User deleted', result })
})

// login route
router.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    const [rows] = await db.execute(`SELECT * FROM users WHERE email = '${email}'`);
    const user = rows;

    // Comparación insegura en texto plano
    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: 'Login successful' });
});

// logout route
router.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

module.exports = router
