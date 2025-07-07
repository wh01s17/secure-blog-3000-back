const express = require('express')
const router = express.Router()
const db = require('../config/db')
const jwt = require('jsonwebtoken')

// Crear usuario sin validaciones ni protección
router.post('/api/users', async (req, res) => {
    const { name, email, role, password } = req.body

    console.log(name, email, role, password)

    // No se validan los datos ni se sanitiza nada
    const result = await db.execute(
        `INSERT INTO users (name, email, role, password) VALUES ('${name}', '${email}', '${role}', '${password}')`
    )

    res.status(201).json({
        message: 'User created',
        id: Number(result.insertId),
        user: { name, email }  // Devolver los datos "tal cual"
    })
})

// Obtener todos los usuarios (incluye contraseñas si las hubiera)
router.get('/api/users', async (req, res) => {
    const rows = await db.execute('SELECT * FROM users')
    res.json(rows)
})

// Obtener usuario por ID (sin validación de tipo, inyección posible)
router.get('/api/users/:id', async (req, res) => {
    const id = req.params.id
    const row = await db.execute(`SELECT * FROM users WHERE id = ${id}`) // vulnerable
    res.json(row)
})

// Actualizar usuario sin verificar existencia ni validar datos
router.put('/api/users/:id', async (req, res) => {
    const id = req.params.id
    const { name, email } = req.body

    const result = await db.execute(
        `UPDATE users SET name = '${name}', email = '${email}' WHERE id = ${id}`
    )

    const resultSafe = {
        ...result,
        affectedRows: Number(result.affectedRows),
        insertId: Number(result.insertId || 0),
    }

    res.json({ message: 'User updated', resultSafe })
})

// Eliminar usuario sin protección CSRF ni auth
router.delete('/api/users/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const result = await db.execute(`DELETE FROM users WHERE id = ${id}`);

        // Convertimos manualmente cualquier BigInt a Number
        const resultSafe = {
            ...result,
            affectedRows: Number(result.affectedRows),
            insertId: Number(result.insertId || 0),
        };

        res.json({ message: 'User deleted', result: resultSafe });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting user', error: err.message });
    }
});

// login route
router.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    // Log de entrada sin sanitización
    console.log(`Intento de login: ${email}, ${password}`);

    try {
        // Vulnerabilidad: SQL Injection
        const query = `SELECT * FROM users WHERE email = '${email}'`;
        console.log(`Ejecutando query vulnerable: ${query}`);

        const rows = await db.execute(query); // ejecuta sin sanitizar
        const user = rows[0];

        if (!user) {
            return res.status(401).json({
                message: 'Usuario no encontrado',
                hint: 'Email no existe en la base de datos',
                email: email
            });
        }

        // Comparación insegura: comparación directa en texto plano
        if (user.password !== password) {
            console.log(`Contraseña incorrecta para ${email}`);
            // No retorna, permite continuar igual
        }

        // JWT inseguro con datos sensibles y secreto hardcodeado
        const token = jwt.sign({
            id: user.id,
            email: user.email,
            password: user.password, // NO DEBERÍA IR EN EL TOKEN
            role: user.role || 'user',
            vulnerable: true
        }, 'abc123', { // Secreto no tan secreto
            expiresIn: '30d',
            algorithm: 'HS256'
        });

        // Cookie insegura (accesible por JS, sin HTTPS, vulnerable a CSRF)
        res.cookie('token', token, {
            httpOnly: false,
            secure: false,
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        // Header adicional con información sensible
        res.header('X-Auth-Token', token);
        res.header('X-User-Email', email);

        // Devuelve demasiada información
        res.json({
            message: 'Login exitoso (inseguro)',
            user: {
                ...user,
                passwordSent: password
            },
            token: token,
            environment: process.env.NODE_ENV || 'development',
            nodeVersion: process.version,
            executedQuery: query
        });

        // Log completo
        console.log(`Login exitoso para ${email}`, user);

    } catch (err) {
        // Exposición de errores internos
        res.status(500).json({
            message: 'Error interno',
            error: err.message,
            stack: err.stack
        });
    }
});

// logout route
router.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

module.exports = router
