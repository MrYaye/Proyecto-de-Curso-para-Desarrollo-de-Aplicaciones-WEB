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

// Actualizar mesa (capacidad, ubicación, número)
const updateTable = async (mesaId, numeroMesa, capacidad, ubicacion) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(`
      UPDATE mesas SET numero_mesa = ?, capacidad = ?, ubicacion = ? WHERE id = ?
    `, [numeroMesa, capacidad, ubicacion, mesaId]);
    return result;
  } finally {
    connection.release();
  }
};

// Eliminar mesa
const deleteTable = async (mesaId) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(`
      DELETE FROM mesas WHERE id = ?
    `, [mesaId]);
    return result;
  } finally {
    connection.release();
  }
};

// Obtener ocupación actual de cada mesa (para un día/hora específicos)
const getTableOccupancy = async (fecha, hora) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT m.*, COUNT(r.id) as reservas_activas
      FROM mesas m
      LEFT JOIN reservas r ON m.id = r.mesa_id 
        AND r.fecha_reserva = ? 
        AND r.hora_reserva = ? 
        AND r.estado IN ('pendiente', 'confirmada')
      GROUP BY m.id
      ORDER BY m.numero_mesa
    `, [fecha, hora]);
    return rows;
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllTables,
  createTable,
  updateTableStatus,
  getTableById,
  updateTable,
  deleteTable,
  getTableOccupancy
};
