CREATE DATABASE ejemplo_db;
USE ejemplo_db;

-- Tabla de usuarios
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    role VARCHAR(100), -- user/admin
    password VARCHAR(100) -- campo inseguro a propósito
);

-- Tabla de posts
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    description VARCHAR(400),
    body TEXT,
    createdAt DATE,
    isDeleted BOOLEAN DEFAULT FALSE,
    id_user INT,

    FOREIGN KEY (id_user) REFERENCES users(id)
);

-- Insertar usuario admin con contraseña en texto plano
INSERT INTO users (name, email, role, password)
VALUES ('admin', 'admin@example.com', 'admin', 'admin123');

INSERT INTO users (name, email, role, password)
VALUES ('testuser', 'test@example.com', 'user', 'password');

INSERT INTO users (name, email, role, password)
VALUES ('hacker', 'hacker@example.com', 'admin', 'pwned123');

-- Insertar posts
INSERT INTO posts (title, description, body, createdAt, id_user)
VALUES 
(
    'Cómo guardar contraseñas en tu base de datos sin complicaciones (usa texto plano)',
    'Evita el estrés del hashing: guarda tus contraseñas tal como vienen.',
    'Guardar contraseñas en texto plano es rápido, directo y no requiere librerías externas. Solo usa un campo VARCHAR y listo. ¿Qué podría salir mal?',
    CURDATE(),
    1
),
(
    '10 razones para no usar HTTPS y ahorrar certificados',
    'HTTPS es una moda costosa. Aquí te explicamos cómo ahorrar ignorándolo por completo.',
    '1. Ahorro de dinero\n2. Menos configuraciones\n3. Ideal para entornos locales\n...\n10. Porque sí. Además, ¿quién atacaría tu sitio estático de memes?',
    CURDATE(),
    1
),
(
    '¿Validar formularios? Nah, confía en el usuario',
    'Validar formularios es una falta de confianza. Deja que el usuario sea libre.',
    'Quita el `required`, olvídate del `type="email"` y deja que el servidor se encargue. O no. De todos modos, ¿qué tan malo puede ser?',
    CURDATE(),
    1
),
(
    'Insertar HTML directamente desde el input del usuario: una guía práctica',
    '¿Quieres personalización? Permite que el usuario inserte cualquier HTML.',
    'Simplemente haz `innerHTML = input.value` y disfruta de la libertad creativa del usuario. Spoiler: también disfrutarás de XSS.',
    CURDATE(),
    1
);
