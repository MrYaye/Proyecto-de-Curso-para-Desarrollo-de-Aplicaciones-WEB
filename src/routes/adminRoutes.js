const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Dashboard
router.get('/dashboard', isAuthenticated, isAdmin, adminController.getAdminDashboard);

// Ver todas las reservas
router.get('/reservations', isAuthenticated, isAdmin, adminController.getAllReservations);

// Confirmar reserva
router.get('/reservations/confirm/:reservaId', isAuthenticated, isAdmin, adminController.confirmReservation);

// Completar reserva
router.get('/reservations/complete/:reservaId', isAuthenticated, isAdmin, adminController.completeReservation);

// Cancelar reserva
router.get('/reservations/cancel/:reservaId', isAuthenticated, isAdmin, adminController.adminCancelReservation);

// Ver reservas por fecha
router.get('/reservations/by-date', isAuthenticated, isAdmin, adminController.getReservationsByDate);

// Gestionar mesas
router.get('/tables', isAuthenticated, isAdmin, adminController.getTables);
router.post('/tables', isAuthenticated, isAdmin, adminController.createTable);
router.post('/tables/:mesaId', isAuthenticated, isAdmin, adminController.updateTable);
router.get('/tables/delete/:mesaId', isAuthenticated, isAdmin, adminController.deleteTable);

module.exports = router;
