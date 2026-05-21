const { pool } = require('../models/database');
const bcrypt = require('bcrypt');

// Obtener todas las reservas
const getAllReservations = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT r.*, u.nombre, u.email, u.telefono, m.numero_mesa, m.capacidad
      FROM reservas r
      JOIN users u ON r.usuario_id = u.id
      JOIN mesas m ON r.mesa_id = m.id
      ORDER BY r.fecha_reserva DESC, r.hora_reserva DESC
    `);
    return rows;
  } finally {
    connection.release();
  }
};

// Obtener reservas por usuario
const getReservationsByUser = async (userId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT r.*, m.numero_mesa, m.capacidad
      FROM reservas r
      JOIN mesas m ON r.mesa_id = m.id
      WHERE r.usuario_id = ?
      ORDER BY r.fecha_reserva DESC, r.hora_reserva DESC
    `, [userId]);
    return rows;
  } finally {
    connection.release();
  }
};

// Obtener disponibilidad de mesas
const getAvailableTables = async (fecha, hora, personas, reservaId = null) => {
  const connection = await pool.getConnection();
  try {
    let query = `
      SELECT m.*
      FROM mesas m
      WHERE m.capacidad >= ?
      AND m.id NOT IN (
        SELECT mesa_id FROM reservas
        WHERE fecha_reserva = ? AND hora_reserva = ? AND estado != 'cancelada'`
      ;
    const params = [personas, fecha, hora];

    if (reservaId) {
      query += ' AND id != ?';
      params.push(reservaId);
    }

    query += `
      )
      AND m.estado = 'disponible'
      ORDER BY m.capacidad ASC
    `;

    const [rows] = await connection.query(query, params);
    return rows;
  } finally {
    connection.release();
  }
};

// Crear una nueva reserva
const createReservation = async (userId, mesaId, fecha, hora, numPersonas, observaciones) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(`
      SELECT COUNT(*) AS count
      FROM reservas
      WHERE mesa_id = ?
        AND fecha_reserva = ?
        AND hora_reserva = ?
        AND estado != 'cancelada'
    `, [mesaId, fecha, hora]);

    if (existing[0].count > 0) {
      const error = new Error('La mesa ya está reservada para esa fecha y hora');
      error.code = 'TABLE_BUSY';
      throw error;
    }

    const [result] = await connection.query(`
      INSERT INTO reservas (usuario_id, mesa_id, fecha_reserva, hora_reserva, numero_personas, observaciones)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, mesaId, fecha, hora, numPersonas, observaciones]);
    return result;
  } finally {
    connection.release();
  }
};

// Actualizar reserva
const updateReservation = async (reservaId, mesaId, fecha, hora, numPersonas, observaciones) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(`
      SELECT COUNT(*) AS count
      FROM reservas
      WHERE mesa_id = ?
        AND fecha_reserva = ?
        AND hora_reserva = ?
        AND id != ?
        AND estado != 'cancelada'
    `, [mesaId, fecha, hora, reservaId]);

    if (existing[0].count > 0) {
      const error = new Error('La mesa ya está reservada para esa fecha y hora');
      error.code = 'TABLE_BUSY';
      throw error;
    }

    const [result] = await connection.query(`
      UPDATE reservas
      SET mesa_id = ?, fecha_reserva = ?, hora_reserva = ?, numero_personas = ?, observaciones = ?, actualizado_en = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [mesaId, fecha, hora, numPersonas, observaciones, reservaId]);
    return result;
  } finally {
    connection.release();
  }
};

// Actualizar estado de reserva
const updateReservationStatus = async (reservaId, status) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(`
      UPDATE reservas SET estado = ? WHERE id = ?
    `, [status, reservaId]);
    return result;
  } finally {
    connection.release();
  }
};

// Cancelar reserva
const cancelReservation = async (reservaId) => {
  return updateReservationStatus(reservaId, 'cancelada');
};
// Obtener una reserva por ID
const getReservationById = async (reservaId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT r.*, u.nombre, u.email, m.numero_mesa
      FROM reservas r
      JOIN users u ON r.usuario_id = u.id
      JOIN mesas m ON r.mesa_id = m.id
      WHERE r.id = ?
    `, [reservaId]);
    return rows[0];
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllReservations,
  getReservationsByUser,
  getAvailableTables,
  createReservation,
  updateReservation,
  updateReservationStatus,
  cancelReservation,
  getReservationById
};
