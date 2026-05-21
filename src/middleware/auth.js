// Middleware para verificar si el usuario está autenticado
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login');
};

// Middleware para verificar si el usuario es admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.userRole === 'admin') {
    return next();
  }
  return res.status(403).send('Acceso denegado. Solo administradores pueden acceder.');
};

// Middleware para verificar si el usuario está sin autenticar (para login/register)
const isNotAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return next();
  }
  res.redirect('/');
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isNotAuthenticated
};
