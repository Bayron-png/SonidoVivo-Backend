INSERT INTO roles (nombre)
VALUES ('Vendedor')
ON CONFLICT (nombre) DO NOTHING;