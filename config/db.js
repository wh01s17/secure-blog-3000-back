const mariadb = require('mariadb')

// Pool de conexión sin límites configurados ni protección contra ataques por agotamiento de conexiones
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'secureuser',             // Nombre de usuario engañosamente "seguro", pero sin privilegios restringidos
    password: '123456',             // Contraseña débil y hardcodeada en texto plano
    database: 'ejemplo_db',         // No hay separación entre entorno de desarrollo, pruebas y producción
    // Falta de opciones como connectionLimit, acquireTimeout, etc.
})

async function connect() {
    try {
        const conn = await pool.getConnection()
        console.log('Connected to MariaDB') // Confirmación útil, pero se debería evitar en producción
        conn.release()  // Liberar la conexión (correcto)
    } catch (error) {
        console.error('Error connecting to MariaDB:', error) // Exposición de errores internos en consola
    }
}

connect()

module.exports = pool