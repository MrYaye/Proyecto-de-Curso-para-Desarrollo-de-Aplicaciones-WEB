const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { initializeDatabase } = require('./models/database');
const authRoutes = require('./routes/authRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar vistas
app.set('view engine', 'ejs');
app.set('views', 'views');

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Configurar sesiones
app.set('trust proxy', 1);
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key_here',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: false, // Cambiar a true en producción con HTTPS
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 24 horas
  }
}));

// Middleware para pasar datos de sesión a las vistas
app.use((req, res, next) => {
  res.locals.user = req.session.userId ? {
    id: req.session.userId,
    nombre: req.session.userName,
    rol: req.session.userRole
  } : null;
  next();
});

// Rutas
app.use('/', authRoutes);
app.use('/reservations', reservationRoutes);
app.use('/admin', adminRoutes);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).render('404', { user: res.locals.user });
});

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Inicializar base de datos
    await initializeDatabase();
    
    // Escuchar en el puerto en localhost
    app.listen(PORT, 'localhost', () => {
      console.log(`✓ Servidor ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
