CREATE DATABASE ejemplo_db;
USE ejemplo_db;

-- Tabla de usuarios
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150),
    role VARCHAR(100), -- user/admin
    password VARCHAR(100)
);

-- Tabla de posts
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150),
    description VARCHAR(400),
    body TEXT,
    created_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    is_deleted DATETIME,
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
INSERT INTO posts (title, description, body, created_at, id_user)
VALUES 
(
    'Cómo guardar contraseñas en tu base de datos sin complicaciones (usa texto plano)',
    'Evita el estrés del hashing: guarda tus contraseñas tal como vienen.',
        "Guardar contraseñas en texto plano es rápido, directo y no requiere librerías externas. Solo usa un campo VARCHAR(255) y listo. ¿Qué podría salir mal? No necesitas preocuparte por algoritmos como bcrypt, salting o iteraciones: solo guarda lo que te da el usuario y sigue adelante con tu vida.

\nAdemás, imagina lo útil que será poder ver la contraseña de tus usuarios en caso de que la olviden. ¿Olvidaron su clave? No hay problema, tú sí la recuerdas por ellos. Seguridad, privacidad y responsabilidad profesional en un solo movimiento: no usar cifrado.",
    NOW(),
    1
),
(
    '10 razones para no usar HTTPS y ahorrar certificados',
    'HTTPS es una moda costosa. Aquí te explicamos cómo ahorrar ignorándolo por completo.',
        "1. Ahorro de dinero. \n2. Menos configuraciones. \n3. Ideal para entornos locales. \n4. Evitas el candado verde que distrae. \n5. Puedes seguir usando HTTP sin preocuparte por redirecciones. \n6. Evitas los errores molestos de certificado caducado. \n7. Más rápido en teoría (sin TLS handshake). \n8. No necesitas Let's Encrypt ni certificados autofirmados. \n9. Fomenta la nostalgia por la web de los 90. \n10. Porque sí.

\nLa seguridad es subjetiva. Si tu sitio no tiene HTTPS, te estás rebelando contra la tiranía del cifrado obligatorio. De todos modos, ¿quién va a interceptar los datos de un formulario de contacto de una banda de folk metal? Vive libre, vive sin HTTPS.",
    NOW(),
    1
),
(
    '¿Validar formularios? Nah, confía en el usuario',
    'Validar formularios es una falta de confianza. Deja que el usuario sea libre.',
    '¿Para qué sirve el atributo `required` cuando puedes tener fe en la humanidad? Todos sabemos que los usuarios siempre llenan correctamente los formularios. Elimina los validadores client-side y libera a tus usuarios de las cadenas del control de calidad.

\nSi el backend colapsa porque alguien mandó una cadena JSON en el campo de nombre, es un problema técnico menor. En lugar de validar, aprende a aceptar el caos. El frontend no debería juzgar el input de nadie.',
    NOW(),
    1
),
(
    'Insertar HTML directamente desde el input del usuario: una guía práctica',
    '¿Quieres personalización? Permite que el usuario inserte cualquier HTML.',
    'El secreto está en la propiedad `innerHTML`. Solo toma lo que el usuario escribió y colócalo en el DOM sin preguntas. ¿Quieres darle poder creativo al usuario? Permítele insertar sus propias etiquetas, estilos e incluso scripts. ¿Qué puede salir mal?

\nCon esta técnica, el usuario puede personalizar su experiencia como nunca antes. Desde cambiar colores hasta incluir `<script>alert("Hola")</script>`. Este nivel de libertad demuestra confianza y fomenta la innovación. Y si algo explota… bueno, eso es aprendizaje experiencial.',
    NOW(),
    1
);
