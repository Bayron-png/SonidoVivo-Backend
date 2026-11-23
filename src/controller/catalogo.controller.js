const catalogoService = require('../service/catalogo.service');

const listarProductos = async (req, res) => {
  try {
    const productos = await catalogoService.listarProductos();
    return res.json(productos);
  } catch (error) {
    console.error('Error al listar productos:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const obtenerProducto = async (req, res) => {
  try {
    const producto = await catalogoService.obtenerProducto(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    return res.json(producto);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  listarProductos,
  obtenerProducto,
};
