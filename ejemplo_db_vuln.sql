CREATE DATABASE ejemplo_db;
USE ejemplo_db;

-- Tabla de usuarios
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    role VARCHAR(100), -- user/admin
    passwd VARCHAR(100) -- campo inseguro a propósito
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
