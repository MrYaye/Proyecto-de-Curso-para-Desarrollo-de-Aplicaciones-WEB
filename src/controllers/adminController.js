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
    const reservations = await Reservation.getAllReservations();
    res.render('admin/reservations-list', {
      reservations,
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
    res.redirect('/admin/reservations');
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
    res.redirect('/admin/reservations');
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
    res.redirect('/admin/reservations');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al cancelar la reserva');
  }
};

// Gestionar mesas (admin)
const getTables = async (req, res) => {
  try {
    const tables = await Table.getAllTables();
    res.render('admin/tables-management', {
      tables,
      user: { id: req.session.userId, nombre: req.session.userName }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al cargar las mesas');
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
  getReservationsByDate
};
