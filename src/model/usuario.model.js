const CAMPOS_RESPUESTA = [
  'id',
  'nombre',
  'correo',
  'rol_id',
  'rol',
  'activo',
  'creado_en',
];

const desdeFila = (fila) => Object.fromEntries(
  CAMPOS_RESPUESTA
    .filter((campo) => Object.hasOwn(fila, campo))
    .map((campo) => [campo, fila[campo]])
);

const paraLogin = ({ id, nombre, correo, rol }) => ({
  id,
  nombre,
  correo,
  rol,
});

module.exports = {
  desdeFila,
  paraLogin,
};
