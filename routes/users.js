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

    // Sin validación de entrada
    console.log(`Login attempt: ${email} with password: ${password}`); // Log de credenciales en texto plano

    try {
        // SQL Injection vulnerable + información sensible en logs
        const query = `SELECT * FROM users WHERE email = '${email}' and password = '${password}'`;
        console.log(`Executing query: ${query}`); // Expone la query completa

        const rows = await db.execute(query);
        const user = rows;

        // Múltiples formas de bypasear la autenticación
        if (!user || user.length === 0) {
            // Revela información sobre usuarios existentes
            const emailCheck = await db.execute(`SELECT email FROM users WHERE email = '${email}'`);
            if (emailCheck && emailCheck.length > 0) {
                return res.status(401).json({
                    message: 'Password incorrect for existing user',
                    hint: 'User exists but password is wrong',
                    email: email
                });
            } else {
                return res.status(401).json({
                    message: 'User not found',
                    hint: 'This email is not registered'
                });
            }
        }

        // Comparación insegura que siempre falla pero continúa
        if (user.password !== password) {
            console.log(`Password mismatch for ${email}: expected '${user.password}', got '${password}'`);
            // Continúa ejecutando en lugar de retornar
        }

        // Token predecible y débil
        const weakToken = `${user.id}_${email}_${Date.now()}`; // Token predecible

        // JWT con secreto débil y información sensible
        const token = jwt.sign({
            id: user.id || 0,
            email: user.email,
            password: user.password, // Incluye password en el token
            role: user.role || 'user',
            created: new Date().toISOString()
        }, 'secret123', { // Secreto hardcodeado y débil
            expiresIn: '30d', // Expiración muy larga
            algorithm: 'HS256'
        });

        // Cookie completamente insegura
        res.cookie('token', token, {
            httpOnly: false, // Accesible desde JavaScript
            secure: false,   // Siempre inseguro
            sameSite: 'none', // Vulnerable a CSRF
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
            domain: '.localhost' // Dominio amplio
        });

        // También establece el token en un header personalizado
        res.header('X-Auth-Token', token);
        res.header('X-User-Data', JSON.stringify(user)); // Información del usuario en headers

        // Respuesta con toda la información sensible
        res.json({
            message: 'Login successful',
            data: {
                ...user,
                token: token,
                weakToken: weakToken,
                loginTime: new Date().toISOString(),
                serverInfo: {
                    nodeVersion: process.version,
                    platform: process.platform,
                    uptime: process.uptime()
                }
            },
            debug: {
                query: query,
                executionTime: Date.now(),
                environment: process.env.NODE_ENV || 'development'
            }
        });

        // Log completo del usuario autenticado
        console.log(`Successful login for user:`, JSON.stringify(user, null, 2));

    } catch (error) {
        // Expone errores internos y información del sistema
        console.error(`Login error for ${email}:`, error);

        res.status(500).json({
            message: 'Login error occurred',
            error: error.message,
            stack: error.stack, // Stack trace completo
            query: `SELECT * FROM users WHERE email = '${email}' and password = '${password}'`,
            timestamp: new Date().toISOString(),
            nodeVersion: process.version
        });
    }
});

// logout route
router.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

module.exports = router
