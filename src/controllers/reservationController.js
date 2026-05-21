const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

// Mostrar formulario de nueva reserva
const showNewReservationForm = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.redirect('/login');
    }

    res.render('reservations/new', { 
      user: { id: userId, nombre: req.session.userName },
      error: null,
      message: null
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al cargar el formulario');
  }
};

// Mostrar formulario de edición de reserva
const showEditReservationForm = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { reservaId } = req.params;

    const reservation = await Reservation.getReservationById(reservaId);
    if (!reservation || reservation.usuario_id !== userId) {
      return res.redirect('/reservations/my-reservations');
    }

    if (['cancelada', 'completada'].includes(reservation.estado)) {
      return res.redirect('/reservations/my-reservations');
    }

    res.render('reservations/edit', {
      reservation,
      user: { id: userId, nombre: req.session.userName },
      error: null,
      message: null
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al cargar el formulario de edición');
  }
};

// Obtener mesas disponibles
const getAvailableTables = async (req, res) => {
  try {
    const { fecha, hora, personas, reservaId } = req.query;

    if (!fecha || !hora || !personas) {
      return res.json({ error: 'Parámetros incompletos' });
    }

    const availableTables = await Reservation.getAvailableTables(fecha, hora, personas, reservaId);
    res.json(availableTables);
  } catch (error) {
    console.error('Error:', error);
    res.json({ error: 'Error al obtener mesas' });
  }
};

// Crear reserva
const createReservation = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { mesaId, fecha, hora, numPersonas, observaciones } = req.body;

    if (!mesaId || !fecha || !hora || !numPersonas) {
      return res.render('reservations/new', { 
        error: 'Todos los campos requeridos deben completarse',
        message: null,
        user: { id: userId, nombre: req.session.userName }
      });
    }

    await Reservation.createReservation(userId, mesaId, fecha, hora, numPersonas, observaciones);
    res.render('reservations/success', {
      message: 'Reserva creada exitosamente. Recibirás una confirmación en tu email.',
      error: null,
      user: { id: userId, nombre: req.session.userName }
    });
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error.code === 'TABLE_BUSY' || error.message.includes('reservada')
      ? 'La mesa ya está ocupada en ese horario. Elige otra mesa, fecha u hora.'
      : 'Error al crear la reserva';
    res.render('reservations/new', { 
      error: errorMessage,
      message: null,
      user: { id: userId, nombre: req.session.userName }
    });
  }
};

// Actualizar reserva
const updateReservation = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { reservaId } = req.params;
    const { mesaId, fecha, hora, numPersonas, observaciones } = req.body;

    const reservation = await Reservation.getReservationById(reservaId);
    if (!reservation || reservation.usuario_id !== userId) {
      return res.redirect('/reservations/my-reservations');
    }

    if (['cancelada', 'completada'].includes(reservation.estado)) {
      return res.redirect('/reservations/my-reservations');
    }

    if (!mesaId || !fecha || !hora || !numPersonas) {
      return res.render('reservations/edit', {
        reservation,
        error: 'Todos los campos requeridos deben completarse',
        message: null,
        user: { id: userId, nombre: req.session.userName }
      });
    }

    await Reservation.updateReservation(reservaId, mesaId, fecha, hora, numPersonas, observaciones);
    res.redirect('/reservations/my-reservations?message=Reserva actualizada correctamente');
  } catch (error) {
    console.error('Error:', error);
    const reservation = await Reservation.getReservationById(req.params.reservaId);
    const errorMessage = error.code === 'TABLE_BUSY' || error.message.includes('reservada')
      ? 'La mesa ya está ocupada en ese horario. Elige otra mesa, fecha u hora.'
      : 'Error al actualizar la reserva';
    return res.render('reservations/edit', {
      reservation,
      error: errorMessage,
      message: null,
      user: { id: req.session.userId, nombre: req.session.userName }
    });
  }
};

// Ver mis reservas
const getMyReservations = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.redirect('/login');
    }

    const { message, error } = req.query;
    const reservations = await Reservation.getReservationsByUser(userId);
    res.render('reservations/my-reservations', { 
      reservations,
      user: { id: userId, nombre: req.session.userName },
      error: error || null,
      message: message || null
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al cargar las reservas');
  }
};

// Cancelar reserva
const cancelReservation = async (req, res) => {
  try {
    const { reservaId } = req.params;
    const userId = req.session.userId;

    const reservation = await Reservation.getReservationById(reservaId);
    if (!reservation || reservation.usuario_id !== userId) {
      return res.status(403).send('No tienes permiso para cancelar esta reserva');
    }

    await Reservation.cancelReservation(reservaId);
    res.redirect('/reservations/my-reservations');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al cancelar la reserva');
  }
};

module.exports = {
  showNewReservationForm,
  showEditReservationForm,
  getAvailableTables,
  createReservation,
  updateReservation,
  getMyReservations,
  cancelReservation
};
