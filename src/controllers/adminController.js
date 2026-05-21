const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const User = require('../models/User');

// Dashboard admin
const getAdminDashboard = async (req, res) => {
  try {
    const reservations = await Reservation.getAllReservations();
    const tables = await Table.getAllTables();
    const users = await User.getAllUsers();

    res.render('admin/dashboard', {
      reservations: reservations.slice(0, 10),
      tables,
      users: users.length,
      user: { id: req.session.userId, nombre: req.session.userName }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al cargar el dashboard');
  }
};

// Ver todas las reservas (admin)
const getAllReservations = async (req, res) => {
  try {
    const { message } = req.query;
    const reservations = await Reservation.getAllReservations();
    res.render('admin/reservations-list', {
      reservations,
      message: message || null,
      user: { id: req.session.userId, nombre: req.session.userName }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al cargar las reservas');
  }
};

// Confirmar reserva (admin)
const confirmReservation = async (req, res) => {
  try {
    const { reservaId } = req.params;
    await Reservation.updateReservationStatus(reservaId, 'confirmada');
    res.redirect('/admin/reservations?message=Reserva confirmada exitosamente');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al confirmar la reserva');
  }
};

// Marcar reserva como completada
const completeReservation = async (req, res) => {
  try {
    const { reservaId } = req.params;
    await Reservation.updateReservationStatus(reservaId, 'completada');
    res.redirect('/admin/reservations?message=Reserva marcada como completada');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al completar la reserva');
  }
};

// Cancelar reserva (admin)
const adminCancelReservation = async (req, res) => {
  try {
    const { reservaId } = req.params;
    await Reservation.cancelReservation(reservaId);
    res.redirect('/admin/reservations?message=Reserva cancelada exitosamente');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al cancelar la reserva');
  }
};

// Gestionar mesas (admin) - Ver todas
const getTables = async (req, res) => {
  try {
    const { message, error } = req.query;
    const tables = await Table.getAllTables();
    
    // Obtener ocupación actual (para hoy a una hora estándar o próxima)
    const today = new Date().toISOString().split('T')[0];
    const occupancy = await Table.getTableOccupancy(today, '19:00');
    const occupancyMap = occupancy.reduce((map, row) => {
      map[row.id] = row.reservas_activas;
      return map;
    }, {});
    
    res.render('admin/tables-management', {
      tables: tables.map(t => ({ ...t, reservas_activas: occupancyMap[t.id] || 0 })),
      message: message || null,
      error: error || null,
      user: { id: req.session.userId, nombre: req.session.userName }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al cargar las mesas');
  }
};

// Crear mesa
const createTable = async (req, res) => {
  try {
    const { numeroMesa, capacidad, ubicacion } = req.body;
    
    if (!numeroMesa || !capacidad) {
      return res.redirect('/admin/tables?error=Número y capacidad son requeridos');
    }
    
    await Table.createTable(parseInt(numeroMesa), parseInt(capacidad), ubicacion || '');
    res.redirect('/admin/tables?message=Mesa creada exitosamente');
  } catch (error) {
    console.error('Error:', error);
    const msg = error.message.includes('UNIQUE') ? 'Ya existe una mesa con ese número' : 'Error al crear la mesa';
    res.redirect(`/admin/tables?error=${encodeURIComponent(msg)}`);
  }
};

// Actualizar mesa
const updateTable = async (req, res) => {
  try {
    const { mesaId } = req.params;
    const { numeroMesa, capacidad, ubicacion } = req.body;
    
    if (!numeroMesa || !capacidad) {
      return res.redirect('/admin/tables?error=Número y capacidad son requeridos');
    }
    
    await Table.updateTable(mesaId, parseInt(numeroMesa), parseInt(capacidad), ubicacion || '');
    res.redirect('/admin/tables?message=Mesa actualizada exitosamente');
  } catch (error) {
    console.error('Error:', error);
    const msg = error.message.includes('UNIQUE') ? 'Ya existe una mesa con ese número' : 'Error al actualizar la mesa';
    res.redirect(`/admin/tables?error=${encodeURIComponent(msg)}`);
  }
};

// Eliminar mesa
const deleteTable = async (req, res) => {
  try {
    const { mesaId } = req.params;
    await Table.deleteTable(mesaId);
    res.redirect('/admin/tables?message=Mesa eliminada exitosamente');
  } catch (error) {
    console.error('Error:', error);
    res.redirect('/admin/tables?error=Error al eliminar la mesa');
  }
};

// Ver reservas por fecha
const getReservationsByDate = async (req, res) => {
  try {
    const { fecha } = req.query;
    const reservations = await Reservation.getAllReservations();
    
    const filteredReservations = reservations.filter(r => r.fecha_reserva.toISOString().split('T')[0] === fecha);
    
    res.render('admin/reservations-by-date', {
      reservations: filteredReservations,
      fecha,
      user: { id: req.session.userId, nombre: req.session.userName }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al cargar las reservas');
  }
};

module.exports = {
  getAdminDashboard,
  getAllReservations,
  confirmReservation,
  completeReservation,
  adminCancelReservation,
  getTables,
  createTable,
  updateTable,
  deleteTable,
  getReservationsByDate
};
