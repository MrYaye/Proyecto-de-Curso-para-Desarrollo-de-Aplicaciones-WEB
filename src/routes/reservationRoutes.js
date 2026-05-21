const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { isAuthenticated } = require('../middleware/auth');

// Mostrar formulario de nueva reserva
router.get('/new', isAuthenticated, reservationController.showNewReservationForm);

// Mostrar formulario de edición de reserva
router.get('/edit/:reservaId', isAuthenticated, reservationController.showEditReservationForm);

// Obtener mesas disponibles (API)
router.get('/available', isAuthenticated, reservationController.getAvailableTables);

// Crear nueva reserva
router.post('/create', isAuthenticated, reservationController.createReservation);

// Actualizar reserva
router.post('/edit/:reservaId', isAuthenticated, reservationController.updateReservation);

// Ver mis reservas
router.get('/my-reservations', isAuthenticated, reservationController.getMyReservations);

// Exportar reservas a CSV
router.get('/export/csv', isAuthenticated, reservationController.exportReservationsCsv);

// Generar PDF de una reserva
router.get('/export/pdf/:reservaId', isAuthenticated, reservationController.exportReservationPdf);

// Cancelar reserva
router.get('/cancel/:reservaId', isAuthenticated, reservationController.cancelReservation);

module.exports = router;
