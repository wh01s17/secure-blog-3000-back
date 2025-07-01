const express = require('express')
const router = express.Router()
const db = require('../config/db')

// Crear usuario sin validaciones ni protección
router.post('/api/users', async (req, res) => {
    const { name, email } = req.body

    // No se validan los datos ni se sanitiza nada
    const [result] = await db.query(
        `INSERT INTO users (name, email) VALUES ('${name}', '${email}')`
    )

    res.status(201).json({
        message: 'User created',
        id: result.insertId,
        user: { name, email }  // Devolver los datos "tal cual"
    })
})

// Obtener todos los usuarios (incluye contraseñas si las hubiera)
router.get('/api/users', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM users')
    res.json(rows)
})

// Obtener usuario por ID (sin validación de tipo, inyección posible)
router.get('/api/users/:id', async (req, res) => {
    const id = req.params.id
    const [row] = await db.query(`SELECT * FROM users WHERE id = ${id}`) // vulnerable
    res.json(row)
})

// Actualizar usuario sin verificar existencia ni validar datos
router.put('/api/users/:id', async (req, res) => {
    const id = req.params.id
    const { name, email } = req.body

    const [result] = await db.query(
        `UPDATE users SET name = '${name}', email = '${email}' WHERE id = ${id}`
    )

    res.json({ message: 'User updated', result })
})

// Eliminar usuario sin protección CSRF ni auth
router.delete('/api/users/:id', async (req, res) => {
    const id = req.params.id
    const [result] = await db.query(`DELETE FROM users WHERE id = ${id}`)
    res.json({ message: 'User deleted', result })
})

module.exports = router
