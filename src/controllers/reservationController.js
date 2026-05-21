const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const PDFDocument = require('pdfkit');

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

    const { message, error, fecha, estado, mesa } = req.query;
    let reservations = await Reservation.getReservationsByUser(userId);

    if (fecha) {
      reservations = reservations.filter(r => r.fecha_reserva.toISOString().split('T')[0] === fecha);
    }

    if (estado && estado !== 'todos') {
      reservations = reservations.filter(r => r.estado === estado);
    }

    if (mesa) {
      reservations = reservations.filter(r => String(r.numero_mesa) === String(mesa));
    }

    const today = new Date().toISOString().split('T')[0];
    const upcomingReservations = reservations.filter(r => {
      const reservationDate = r.fecha_reserva.toISOString().split('T')[0];
      return r.estado !== 'cancelada' && reservationDate >= today;
    });
    const historyReservations = reservations.filter(r => {
      const reservationDate = r.fecha_reserva.toISOString().split('T')[0];
      return r.estado === 'cancelada' || reservationDate < today;
    });

    res.render('reservations/my-reservations', {
      upcomingReservations,
      historyReservations,
      user: { id: userId, nombre: req.session.userName },
      error: error || null,
      message: message || null,
      filters: {
        fecha: fecha || '',
        estado: estado || 'todos',
        mesa: mesa || ''
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al cargar las reservas');
  }
};

const buildFiltersForCsv = (reservations, fecha, estado, mesa) => {
  let filtered = reservations;

  if (fecha) {
    filtered = filtered.filter(r => r.fecha_reserva.toISOString().split('T')[0] === fecha);
  }

  if (estado && estado !== 'todos') {
    filtered = filtered.filter(r => r.estado === estado);
  }

  if (mesa) {
    filtered = filtered.filter(r => String(r.numero_mesa) === String(mesa));
  }

  return filtered;
};

const exportReservationsCsv = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { fecha, estado, mesa } = req.query;
    const reservations = await Reservation.getReservationsByUser(userId);
    const filteredReservations = buildFiltersForCsv(reservations, fecha, estado, mesa);

    const escapeCsvValue = (value) => {
      if (value === null || value === undefined) return '';
      const text = String(value).replace(/\r?\n/g, ' ').replace(/"/g, '""');
      return text.includes(';') || text.includes('"')
        ? `"${text}"`
        : text;
    };

    let csv = 'Reserva ID;Fecha;Hora;Mesa;Personas;Estado;Observaciones\n';

    filteredReservations.forEach((r) => {
      csv += [
        r.id,
        r.fecha_reserva.toISOString().split('T')[0],
        r.hora_reserva,
        r.numero_mesa,
        r.numero_personas,
        r.estado,
        r.observaciones || ''
      ]
        .map(escapeCsvValue)
        .join(';');
      csv += '\n';
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=reservas.csv');
    res.send('\uFEFF' + csv);
  } catch (error) {
    console.error('Error al exportar CSV:', error);
    res.status(500).send('Error al generar el archivo CSV');
  }
};

const exportReservationPdf = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { reservaId } = req.params;
    const reservation = await Reservation.getReservationById(reservaId);

    if (!reservation || reservation.usuario_id !== userId) {
      return res.status(403).send('No tienes permiso para descargar este PDF');
    }

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reserva_${reservaId}.pdf"`);

    doc.fontSize(20).fillColor('#2c3e50').text('Detalle de la Reserva', { align: 'center' });
    doc.moveDown(1);

    const formatLabel = (label, value) => {
      doc.fontSize(12).fillColor('#34495e').text(`${label}:`, { continued: true }).font('Helvetica-Bold').text(` ${value}`);
    };

    formatLabel('Reserva ID', reservation.id);
    formatLabel('Nombre', reservation.nombre);
    formatLabel('Email', reservation.email);
    formatLabel('Mesa', reservation.numero_mesa);
    formatLabel('Personas', reservation.numero_personas);
    formatLabel('Fecha', reservation.fecha_reserva.toISOString().split('T')[0]);
    formatLabel('Hora', reservation.hora_reserva);
    formatLabel('Estado', reservation.estado);
    if (reservation.observaciones) {
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('Observaciones:');
      doc.font('Helvetica').fontSize(12).fillColor('#34495e').text(reservation.observaciones, { paragraphGap: 6 });
    }

    doc.moveDown(1);
    doc.fontSize(10).fillColor('#7f8c8d').text('Gracias por usar el sistema de reservas. Presenta este documento en la llegada al restaurante.', { align: 'center' });

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    res.status(500).send('Error al generar el PDF');
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
    res.redirect('/reservations/my-reservations?message=Reserva cancelada exitosamente');
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
  exportReservationsCsv,
  exportReservationPdf,
  cancelReservation
};
