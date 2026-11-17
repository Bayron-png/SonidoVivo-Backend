-- 1. Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
);

-- 2. Roles existentes en SonidoVivo (id = 1: Administrador, id = 2: Cliente)
INSERT INTO roles (nombre) VALUES
('Administrador'),
('Cliente')
ON CONFLICT (nombre) DO NOTHING;

-- 3. Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INTEGER NOT NULL REFERENCES roles(id),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);