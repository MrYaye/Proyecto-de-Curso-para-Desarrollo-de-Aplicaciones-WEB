const { pool } = require('../models/database');
const bcrypt = require('bcrypt');

// Crear usuario
const createUser = async (nombre, email, password, telefono) => {
  const connection = await pool.getConnection();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await connection.query(`
      INSERT INTO users (nombre, email, password, telefono)
      VALUES (?, ?, ?, ?)
    `, [nombre, email, hashedPassword, telefono]);
    return result;
  } finally {
    connection.release();
  }
};

// Obtener usuario por email
const getUserByEmail = async (email) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT * FROM users WHERE email = ?
    `, [email]);
    return rows[0];
  } finally {
    connection.release();
  }
};

// Obtener usuario por ID
const getUserById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT id, nombre, email, telefono, rol FROM users WHERE id = ?
    `, [id]);
    return rows[0];
  } finally {
    connection.release();
  }
};

// Obtener usuario por ID incluyendo contraseña
const getUserByIdWithPassword = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT id, nombre, email, telefono, rol, password FROM users WHERE id = ?
    `, [id]);
    return rows[0];
  } finally {
    connection.release();
  }
};

// Verificar contraseña
const verifyPassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

// Obtener todos los usuarios (admin)
const getAllUsers = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT id, nombre, email, telefono, rol, creado_en FROM users
      ORDER BY creado_en DESC
    `);
    return rows;
  } finally {
    connection.release();
  }
};

// Actualizar perfil de usuario
const updateUserProfile = async (id, nombre, email, telefono) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(`
      UPDATE users SET nombre = ?, email = ?, telefono = ?, actualizado_en = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [nombre, email, telefono, id]);
    return result;
  } finally {
    connection.release();
  }
};

// Cambiar contraseña
const updateUserPassword = async (id, password) => {
  const connection = await pool.getConnection();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await connection.query(`
      UPDATE users SET password = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?
    `, [hashedPassword, id]);
    return result;
  } finally {
    connection.release();
  }
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  getUserByIdWithPassword,
  verifyPassword,
  getAllUsers,
  updateUserProfile,
  updateUserPassword
};
