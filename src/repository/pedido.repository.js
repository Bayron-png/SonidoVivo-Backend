const pool = require('../config/db');

const crearError = (codigo, mensaje) =>
    Object.assign(new Error(mensaje), { codigo });

const crearPedido = async ({
    usuarioId,
    items,
    tipoEnvio,
    costoEnvio,
}) => {
    const cliente = await pool.connect();

    try {
        await cliente.query('BEGIN');

        const detalles = [];
        let subtotalPedido = 0;

        // Ordenar los productos reduce el riesgo de bloqueos
        // cruzados entre pedidos simultáneos.
        const itemsOrdenados = [...items].sort((a, b) =>
            a.productoId.localeCompare(b.productoId)
        );

        for (const item of itemsOrdenados) {
            const resultado = await cliente.query(
                `SELECT id, precio, stock
                 FROM productos
                 WHERE id = $1 AND activo = TRUE
                 FOR UPDATE`,
                [item.productoId]
            );

            const producto = resultado.rows[0];

            if (!producto) {
                throw crearError(
                    'PRODUCTO_NO_DISPONIBLE',
                    `Producto no disponible: ${item.productoId}`
                );
            }

            if (producto.stock < item.cantidad) {
                throw crearError(
                    'STOCK_INSUFICIENTE',
                    `Stock insuficiente para ${producto.id}`
                );
            }

            const subtotal = producto.precio * item.cantidad;

            if (!Number.isSafeInteger(subtotal) || subtotal > 2147483647) {
                throw crearError(
                    'TOTAL_INVALIDO',
                    'El total del pedido supera el máximo permitido'
                );
            }

            subtotalPedido += subtotal;

            detalles.push({
                productoId: producto.id,
                cantidad: item.cantidad,
                precioUnitario: producto.precio,
                subtotal,
            });
        }

        const total = subtotalPedido + costoEnvio;

        if (!Number.isSafeInteger(total) || total > 2147483647) {
            throw crearError(
                'TOTAL_INVALIDO',
                'El total del pedido supera el máximo permitido'
            );
        }

        const resultadoPedido = await cliente.query(
            `INSERT INTO pedidos (
                 usuario_id, tipo_envio, costo_envio, total
             )
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [usuarioId, tipoEnvio, costoEnvio, total]
        );

        const pedido = resultadoPedido.rows[0];

        for (const detalle of detalles) {
            await cliente.query(
                `INSERT INTO pedido_detalles (
                     pedido_id, producto_id, cantidad,
                     precio_unitario, subtotal
                 )
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    pedido.id,
                    detalle.productoId,
                    detalle.cantidad,
                    detalle.precioUnitario,
                    detalle.subtotal,
                ]
            );

            const actualizacion = await cliente.query(
                `UPDATE productos
                 SET stock = stock - $1
                 WHERE id = $2 AND stock >= $1`,
                [detalle.cantidad, detalle.productoId]
            );

            if (actualizacion.rowCount !== 1) {
                throw crearError(
                    'STOCK_INSUFICIENTE',
                    `Stock insuficiente para ${detalle.productoId}`
                );
            }
        }

        await cliente.query('COMMIT');

        return {
            ...pedido,
            detalles,
        };
    } catch (error) {
        await cliente.query('ROLLBACK');
        throw error;
    } finally {
        cliente.release();
    }
};

const listarPedidosPorUsuario = async (usuarioId) => {
    const resultado = await pool.query(
        `SELECT
             id,
             usuario_id,
             estado,
             tipo_envio,
             costo_envio,
             total,
             creado_en,
             actualizado_en
         FROM pedidos
         WHERE usuario_id = $1
         ORDER BY creado_en DESC, id DESC`,
        [usuarioId]
    );

    return resultado.rows;
};

const buscarPedidoPorId = async (id, usuarioId, puedeVerTodos) => {
    const resultado = await pool.query(
        `SELECT
             p.id,
             p.usuario_id,
             p.estado,
             p.tipo_envio,
             p.costo_envio,
             p.total,
             p.creado_en,
             p.actualizado_en,
             COALESCE(
                 (
                     SELECT json_agg(
                         json_build_object(
                             'productoId', d.producto_id,
                             'cantidad', d.cantidad,
                             'precioUnitario', d.precio_unitario,
                             'subtotal', d.subtotal
                         )
                         ORDER BY d.producto_id
                     )
                     FROM pedido_detalles d
                     WHERE d.pedido_id = p.id
                 ),
                 '[]'::json
             ) AS detalles
         FROM pedidos p
         WHERE p.id = $1
           AND (p.usuario_id = $2 OR $3::boolean)`,
        [id, usuarioId, puedeVerTodos]
    );

    return resultado.rows[0] || null;
};

const listarPedidos = async () => {
    const resultado = await pool.query(
        `SELECT
             p.id,
             p.usuario_id,
             u.nombre AS cliente_nombre,
             u.correo AS cliente_correo,
             p.estado,
             p.tipo_envio,
             p.costo_envio,
             p.total,
             p.creado_en,
             p.actualizado_en
         FROM pedidos p
         INNER JOIN usuarios u ON p.usuario_id = u.id
         ORDER BY p.creado_en DESC, p.id DESC`
    );

    return resultado.rows;
};

const cambiarEstadoPedido = async (id, nuevoEstado) => {
    const cliente = await pool.connect();

    try {
        await cliente.query('BEGIN');

        const resultado = await cliente.query(
            `SELECT id, estado
             FROM pedidos
             WHERE id = $1
             FOR UPDATE`,
            [id]
        );

        const pedido = resultado.rows[0];

        if (!pedido) {
            throw crearError(
                'PEDIDO_NO_ENCONTRADO',
                'Pedido no encontrado'
            );
        }

        const cambiaEstado = pedido.estado !== nuevoEstado;
        const entraEnCancelado =
            cambiaEstado && nuevoEstado === 'Cancelado';
        const saleDeCancelado =
            cambiaEstado && pedido.estado === 'Cancelado';

        if (entraEnCancelado || saleDeCancelado) {
            const detalles = await cliente.query(
                `SELECT producto_id, cantidad
                 FROM pedido_detalles
                 WHERE pedido_id = $1
                 ORDER BY producto_id`,
                [id]
            );

            for (const detalle of detalles.rows) {
                let resultadoStock;

                if (entraEnCancelado) {
                    resultadoStock = await cliente.query(
                        `UPDATE productos
                         SET stock = stock + $1
                         WHERE id = $2
                           AND stock <= 2147483647 - $1`,
                        [detalle.cantidad, detalle.producto_id]
                    );

                    if (resultadoStock.rowCount !== 1) {
                        throw crearError(
                            'STOCK_RESTAURACION_INVALIDA',
                            `No se pudo restaurar el stock de ${detalle.producto_id}`
                        );
                    }
                } else {
                    resultadoStock = await cliente.query(
                        `UPDATE productos
                         SET stock = stock - $1
                         WHERE id = $2
                           AND stock >= $1`,
                        [detalle.cantidad, detalle.producto_id]
                    );

                    if (resultadoStock.rowCount !== 1) {
                        throw crearError(
                            'STOCK_INSUFICIENTE',
                            `Stock insuficiente para reactivar ${detalle.producto_id}`
                        );
                    }
                }
            }
        }

        const actualizado = await cliente.query(
            `UPDATE pedidos
             SET estado = $2,
                 actualizado_en = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [id, nuevoEstado]
        );

        await cliente.query('COMMIT');

        return actualizado.rows[0];
    } catch (error) {
        await cliente.query('ROLLBACK');
        throw error;
    } finally {
        cliente.release();
    }
};

module.exports = {
    crearPedido,
    listarPedidosPorUsuario,
    buscarPedidoPorId,
    listarPedidos,
    cambiarEstadoPedido,
};