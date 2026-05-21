-- =====================================================
-- Script de Inicialización de Base de Datos
-- Sistema de Reservas de Restaurante
-- =====================================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS restaurant_reservations 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE restaurant_reservations;

-- =====================================================
-- Tabla de Usuarios
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  rol ENUM('client', 'admin') DEFAULT 'client',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- =====================================================
-- Tabla de Mesas
-- =====================================================
CREATE TABLE IF NOT EXISTS mesas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_mesa INT UNIQUE NOT NULL,
  capacidad INT NOT NULL,
  ubicacion VARCHAR(50),
  estado ENUM('disponible', 'ocupada', 'reservada') DEFAULT 'disponible',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Tabla de Reservas
-- =====================================================
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
  INDEX idx_fecha_reserva (fecha_reserva),
  INDEX idx_usuario_id (usuario_id),
  UNIQUE KEY unique_mesa_datetime (mesa_id, fecha_reserva, hora_reserva)
);

-- =====================================================
-- Insertar Mesas de Prueba
-- =====================================================
INSERT INTO mesas (numero_mesa, capacidad, ubicacion) VALUES 
(1, 2, 'Ventana Frontal'),
(2, 2, 'Ventana Lateral'),
(3, 4, 'Centro Izquierda'),
(4, 4, 'Centro Derecha'),
(5, 6, 'Terraza'),
(6, 6, 'Rincón Privado'),
(7, 4, 'Entrada'),
(8, 2, 'Barra');

-- =====================================================
-- Verificación Final
-- =====================================================
SELECT '✓ Base de datos inicializada correctamente' as status;
SELECT COUNT(*) as total_mesas FROM mesas;
