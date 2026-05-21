const { pool } = require('../models/database');

// Obtener todas las mesas
const getAllTables = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT * FROM mesas ORDER BY numero_mesa
    `);
    return rows;
  } finally {
    connection.release();
  }
};

// Crear mesa
const createTable = async (numeroMesa, capacidad, ubicacion) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(`
      INSERT INTO mesas (numero_mesa, capacidad, ubicacion)
      VALUES (?, ?, ?)
    `, [numeroMesa, capacidad, ubicacion]);
    return result;
  } finally {
    connection.release();
  }
};

// Actualizar estado de mesa
const updateTableStatus = async (mesaId, estado) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(`
      UPDATE mesas SET estado = ? WHERE id = ?
    `, [estado, mesaId]);
    return result;
  } finally {
    connection.release();
  }
};

// Obtener mesa por ID
const getTableById = async (mesaId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT * FROM mesas WHERE id = ?
    `, [mesaId]);
    return rows[0];
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllTables,
  createTable,
  updateTableStatus,
  getTableById
};
