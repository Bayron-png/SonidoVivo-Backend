const catalogoRepository = require('../repository/catalogo.repository');

const listarProductos = async () => {
  return catalogoRepository.listarProductos();
};

const obtenerProducto = async (id) => {
  return catalogoRepository.obtenerProducto(id);
};

module.exports = {
  listarProductos,
  obtenerProducto,
};
