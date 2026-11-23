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

-- 4. Usuario administrador de pruebas
-- Credenciales:
--   Correo: admin@sonidovivo.local
--   Contraseña: Admin123!
INSERT INTO usuarios (nombre, correo, password_hash, rol_id)
SELECT
    'Administrador',
    'admin@sonidovivo.local',
    '$2b$10$uuYiefsHFOOlaiMpYCBjFejQeKbTAB3j8IY.e4MzehjiBHPlGq4D6',
    roles.id
FROM roles
WHERE roles.nombre = 'Administrador'
ON CONFLICT (correo) DO UPDATE
SET
    nombre = EXCLUDED.nombre,
    password_hash = EXCLUDED.password_hash,
    rol_id = EXCLUDED.rol_id,
    activo = TRUE;
