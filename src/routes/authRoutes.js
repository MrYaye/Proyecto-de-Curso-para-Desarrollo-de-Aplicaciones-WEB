const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated, isNotAuthenticated } = require('../middleware/auth');

// Página de inicio
router.get('/', (req, res) => {
  res.render('index', { 
    user: req.session.userId ? { id: req.session.userId, nombre: req.session.userName } : null
  });
});

// Formulario de registro
router.get('/register', isNotAuthenticated, (req, res) => {
  res.render('register', { error: null, message: null });
});

// Procesar registro
router.post('/register', isNotAuthenticated, authController.registerController);

// Formulario de login
router.get('/login', isNotAuthenticated, (req, res) => {
  res.render('login', { error: null, message: null });
});

// Procesar login
router.post('/login', isNotAuthenticated, authController.loginController);

// Perfil de usuario
router.get('/profile', isAuthenticated, authController.showProfile);
router.post('/profile', isAuthenticated, authController.updateProfile);

// (Cambio de contraseña integrado en /profile)

// Logout
router.get('/logout', authController.logoutController);

module.exports = router;
