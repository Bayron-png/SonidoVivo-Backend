-- Tabla principal de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,

    usuario_id INTEGER NOT NULL
        REFERENCES usuarios(id),

    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente'
        CHECK (estado IN (
            'Pendiente',
            'Confirmado',
            'Enviado',
            'Entregado',
            'Cancelado'
        )),

    tipo_envio VARCHAR(15) NOT NULL DEFAULT 'retiro'
        CHECK (tipo_envio IN ('retiro', 'domicilio')),

    costo_envio INTEGER NOT NULL DEFAULT 0
        CHECK (costo_envio >= 0),

    total INTEGER NOT NULL DEFAULT 0
        CHECK (total >= 0),

    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Productos incluidos en cada pedido
CREATE TABLE IF NOT EXISTS pedido_detalles (
    pedido_id INTEGER NOT NULL
        REFERENCES pedidos(id) ON DELETE CASCADE,

    producto_id VARCHAR(20) NOT NULL
        REFERENCES productos(id),

    cantidad INTEGER NOT NULL
        CHECK (cantidad > 0),

    precio_unitario INTEGER NOT NULL
        CHECK (precio_unitario >= 0),

    subtotal INTEGER NOT NULL
        CHECK (subtotal >= 0),

    PRIMARY KEY (pedido_id, producto_id)
);

-- Índices para consultar pedidos
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario
    ON pedidos(usuario_id);

CREATE INDEX IF NOT EXISTS idx_pedidos_estado
    ON pedidos(estado);