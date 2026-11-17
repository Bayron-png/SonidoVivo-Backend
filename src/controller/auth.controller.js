const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const register = async (req, res) => {
  const { nombre, correo, password } = req.body;

  if (!nombre || !correo || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios (nombre, correo, password)' });
  }

  try {
    // 1. Verificar si el correo ya existe
    const userExists = await pool.query('SELECT id FROM usuarios WHERE correo = $1', [correo]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // 2. Buscar el id del rol 'Cliente' en la tabla roles (asignado por el servidor)
    const rolResult = await pool.query("SELECT id, nombre FROM roles WHERE nombre = 'Cliente'");
    if (rolResult.rows.length === 0) {
      return res.status(500).json({ error: 'El rol Cliente no está configurado en la base de datos' });
    }
    const rolCliente = rolResult.rows[0];

    // 3. Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Insertar usuario en la BD
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, correo, password_hash, rol_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, correo, rol_id, activo, creado_en`,
      [nombre, correo, passwordHash, rolCliente.id]
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        ...result.rows[0],
        rol: rolCliente.nombre,
      },
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const login = async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ error: 'Debe ingresar correo y contraseña' });
  }

  try {
    // Buscar usuario activo y traer el nombre de su rol desde la tabla roles
    const query = `
      SELECT u.id, u.nombre, u.correo, u.password_hash, u.rol_id, r.nombre AS rol
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.correo = $1 AND u.activo = TRUE
    `;
    const result = await pool.query(query, [correo]);

    // Error genérico requerido por la pauta si no existe o contraseña incorrecta
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = result.rows[0];
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT con id, correo y rol
    const payload = {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '2h',
    });

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { register, login };