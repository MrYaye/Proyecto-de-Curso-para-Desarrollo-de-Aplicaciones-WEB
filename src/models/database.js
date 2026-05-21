const pool = require('../config/database');
const bcrypt = require('bcrypt');

// Crear tabla de usuarios
const createUsersTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        telefono VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        rol ENUM('client', 'admin') DEFAULT 'client',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla users creada o ya existe');
  } catch (error) {
    console.error('Error creating users table:', error);
  } finally {
    connection.release();
  }
};

// Crear tabla de mesas
const createTablesTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS mesas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        numero_mesa INT UNIQUE NOT NULL,
        capacidad INT NOT NULL,
        ubicacion VARCHAR(50),
        estado ENUM('disponible', 'ocupada', 'reservada') DEFAULT 'disponible',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla mesas creada o ya existe');
  } catch (error) {
    console.error('Error creating tables table:', error);
  } finally {
    connection.release();
  }
};

// Crear tabla de reservas
const createReservationsTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reservas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        mesa_id INT NOT NULL,
        fecha_reserva DATE NOT NULL,
        hora_reserva TIME NOT NULL,
        numero_personas INT NOT NULL,
        observaciones TEXT,
        estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') DEFAULT 'pendiente',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (mesa_id) REFERENCES mesas(id) ON DELETE CASCADE,
        INDEX(fecha_reserva),
        INDEX(usuario_id),
        UNIQUE KEY unique_mesa_datetime (mesa_id, fecha_reserva, hora_reserva)
      )
    `);
    console.log('✓ Tabla reservas creada o ya existe');
  } catch (error) {
    console.error('Error creating reservations table:', error);
  } finally {
    connection.release();
  }
};

// Inicializar base de datos
const initializeDatabase = async () => {
  try {
    await createUsersTable();
    await createTablesTable();
    await createReservationsTable();
    console.log('✓ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

module.exports = {
  pool,
  initializeDatabase
};
