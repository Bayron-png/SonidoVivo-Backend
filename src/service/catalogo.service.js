const catalogoRepository = require('../repository/catalogo.repository');
const AppError = require('./app-error');

const esTextoNoVacio = (valor) => typeof valor === 'string' && valor.trim();
const esEnteroNoNegativo = (valor) => Number.isInteger(valor) && valor >= 0;

const validarCamposProducto = (producto) => {
  if (
    !esTextoNoVacio(producto.id)
    || !esTextoNoVacio(producto.nombre)
    || !esTextoNoVacio(producto.categoria)
    || !esTextoNoVacio(producto.categoriaSlug)
    || !esTextoNoVacio(producto.marca)
    || !esTextoNoVacio(producto.modelo)
    || !esTextoNoVacio(producto.imagen)
  ) {
    throw new AppError(
      'id, nombre, categoria, categoriaSlug, marca, modelo e imagen son obligatorios',
      400
    );
  }
  if (
    !esEnteroNoNegativo(producto.stock)
    || !esEnteroNoNegativo(producto.precio)
  ) {
    throw new AppError('stock y precio deben ser enteros mayores o iguales a cero', 400);
  }
};

const listarProductos = async () => {
  return catalogoRepository.listarProductos();
};

const obtenerProducto = async (id) => {
  return catalogoRepository.obtenerProducto(id);
};

const crearProducto = async (datos) => {
  validarCamposProducto(datos);

  const producto = {
    ...datos,
    id: datos.id.trim().toUpperCase(),
    nombre: datos.nombre.trim(),
    categoria: datos.categoria.trim(),
    categoriaSlug: datos.categoriaSlug.trim(),
    marca: datos.marca.trim(),
    modelo: datos.modelo.trim(),
    descripcion: typeof datos.descripcion === 'string' ? datos.descripcion.trim() : '',
    imagen: datos.imagen.trim(),
  };

  if (await catalogoRepository.existeProducto(producto.id)) {
    throw new AppError('Ya existe un producto con ese id', 409);
  }
  return catalogoRepository.crearProducto(producto);
};

const actualizarProducto = async (id, datos) => {
  if (!datos || typeof datos !== 'object') {
    throw new AppError('Debe enviar al menos un campo para actualizar', 400);
  }

  const cambios = {};
  for (const campo of [
    'nombre',
    'categoria',
    'categoriaSlug',
    'marca',
    'modelo',
    'descripcion',
    'imagen',
  ]) {
    if (datos[campo] !== undefined) {
      cambios[campo] = typeof datos[campo] === 'string' ? datos[campo].trim() : datos[campo];
    }
  }
  if (datos.stock !== undefined) {
    if (!esEnteroNoNegativo(datos.stock)) {
      throw new AppError('stock debe ser un entero mayor o igual a cero', 400);
    }
    cambios.stock = datos.stock;
  }
  if (datos.precio !== undefined) {
    if (!esEnteroNoNegativo(datos.precio)) {
      throw new AppError('precio debe ser un entero mayor o igual a cero', 400);
    }
    cambios.precio = datos.precio;
  }
  if (datos.activo !== undefined) {
    if (typeof datos.activo !== 'boolean') {
      throw new AppError('activo debe ser un valor booleano', 400);
    }
    cambios.activo = datos.activo;
  }
  if (Object.keys(cambios).length === 0) {
    throw new AppError('Debe enviar al menos un campo para actualizar', 400);
  }

  const producto = await catalogoRepository.actualizarProducto(
    id.toUpperCase(),
    cambios
  );
  if (!producto) {
    throw new AppError('Producto no encontrado', 404);
  }
  return producto;
};

const desactivarProducto = async (id) => {
  const producto = await catalogoRepository.desactivarProducto(id.toUpperCase());
  if (!producto) {
    throw new AppError('Producto no encontrado', 404);
  }
  return producto;
};

module.exports = {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  desactivarProducto,
};
