const express = require('express')
const router = express.Router()
const db = require('../config/db')

// crear un usuario
router.post('/api/users', async (request, response) => {
    const { name, email } = request.body

    if (!name || !email) {
        return response.status(400).json({ message: 'Parameters are missing' })
    }

    try {
        const { insertId } = await db.execute('INSERT INTO users (name, email) VALUES (?, ?)', [name, email])

        response.status(201).json({
            message: 'User created',
            id: Number(insertId)
        })
    } catch (error) {
        response.status(500).json({
            message: 'Error creating user',
            error: error.message
        })
    }
})

// obtiene todos los usuarios
router.get('/api/users', async (request, response) => {
    try {
        const rows = await db.execute('SELECT * FROM users')

        response.json(rows)
    } catch (error) {
        response.status(500).json({
            message: 'Error getting users',
            error: error.message
        })
    }
})

// obtiene un usuario segun su ID
router.get('/api/users/:id', async (request, response) => {
    try {
        const id = request.params.id
        const row = await db.execute('SELECT * FROM users WHERE id=?', [id])

        response.json(row)
    } catch (error) {
        response.status(500).json({
            message: 'Error getting user',
            error: error.message
        })
    }
})

// actualizar un usuario
router.put('/api/users/:id', async (request, response) => {
    try {
        const id = request.params.id
        const { name, email } = request.body

        const { affectedRows } = await db.execute(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [name, email, id]
        )

        if (affectedRows > 0) {
            response.json({ message: 'User updated successfully' })
        } else {
            response.status(404).json({ message: 'User not found' })
        }
    } catch (error) {
        response.status(500).json({
            message: 'Error updating user',
            error: error.message,
        })
    }
})

// eliminar un usuario
router.delete('/api/users/:id', async (request, response) => {
    try {
        const id = request.params.id

        const { affectedRows } = await db.execute('DELETE FROM users WHERE id = ?', [id])

        if (affectedRows > 0) {
            response.json({ message: 'User deleted successfully' })
        } else {
            response.status(404).json({ message: 'User not found' })
        }
    } catch (error) {
        response.status(500).json({
            message: 'Error deleting user',
            error: error.message,
        })
    }
})

module.exports = router
