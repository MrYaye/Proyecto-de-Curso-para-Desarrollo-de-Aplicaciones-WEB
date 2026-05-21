const User = require('../models/User');

// Controlador para registro
const registerController = async (req, res) => {
  try {
    const { nombre, email, password, confirmPassword, telefono } = req.body;

    // Validaciones
    if (!nombre || !email || !password || !confirmPassword) {
      return res.render('register', { error: 'Todos los campos son requeridos', message: null });
    }

    if (password !== confirmPassword) {
      return res.render('register', { error: 'Las contraseñas no coinciden', message: null });
    }

    const userExists = await User.getUserByEmail(email);
    if (userExists) {
      return res.render('register', { error: 'El email ya está registrado', message: null });
    }

    await User.createUser(nombre, email, password, telefono);
    return res.render('register', { error: null, message: 'Usuario registrado exitosamente. Por favor, inicia sesión' });
  } catch (error) {
    console.error('Error en registro:', error);
    return res.render('register', { error: 'Error al registrar usuario', message: null });
  }
};

// Controlador para login
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('login', { error: 'Email y contraseña requeridos', message: null });
    }

    const user = await User.getUserByEmail(email);
    if (!user) {
      return res.render('login', { error: 'Email o contraseña incorrectos', message: null });
    }

    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.render('login', { error: 'Email o contraseña incorrectos', message: null });
    }

    req.session.userId = user.id;
    req.session.userName = user.nombre;
    req.session.userRole = user.rol;

    if (user.rol === 'admin') {
      return res.redirect('/admin/dashboard');
    }
    return res.redirect('/reservations/new');
  } catch (error) {
    console.error('Error en login:', error);
    return res.render('login', { error: 'Error al iniciar sesión', message: null });
  }
};

// Controlador para logout
const logoutController = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

// Mostrar formulario de perfil
const showProfile = async (req, res) => {
  try {
    const user = await User.getUserById(req.session.userId);
    return res.render('profile', {
      user,
      error: null,
      message: null
    });
  } catch (error) {
    console.error('Error al cargar perfil:', error);
    return res.render('profile', { error: 'Error al cargar perfil', message: null, user: null });
  }
};

// Actualizar perfil
const updateProfile = async (req, res) => {
  try {
    const { nombre, email, telefono } = req.body;
    const userId = req.session.userId;

    if (!nombre || !email) {
      const user = await User.getUserById(userId);
      return res.render('profile', { error: 'El nombre y email son obligatorios', message: null, user });
    }

    const existingUser = await User.getUserByEmail(email);
    if (existingUser && existingUser.id !== userId) {
      const user = await User.getUserById(userId);
      return res.render('profile', { error: 'El email ya está en uso', message: null, user });
    }

    await User.updateUserProfile(userId, nombre, email, telefono);
    req.session.userName = nombre;

    const updatedUser = await User.getUserById(userId);
    return res.render('profile', { error: null, message: 'Perfil actualizado correctamente', user: updatedUser });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    const user = await User.getUserById(req.session.userId);
    return res.render('profile', { error: 'Error al actualizar perfil', message: null, user });
  }
};

// Mostrar formulario de cambio de contraseña
const showChangePassword = async (req, res) => {
  try {
    const user = await User.getUserById(req.session.userId);
    return res.render('change-password', { error: null, message: null, user });
  } catch (error) {
    console.error('Error al cargar cambio de contraseña:', error);
    return res.render('change-password', { error: 'Error al cargar la página', message: null, user: null });
  }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.session.userId;
    const user = await User.getUserByIdWithPassword(userId);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.render('change-password', { error: 'Todos los campos son obligatorios', message: null, user });
    }

    if (newPassword !== confirmNewPassword) {
      return res.render('change-password', { error: 'Las nuevas contraseñas no coinciden', message: null, user });
    }

    const isValid = await User.verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return res.render('change-password', { error: 'Contraseña actual incorrecta', message: null, user });
    }

    const isSameAsCurrent = await User.verifyPassword(newPassword, user.password);
    if (isSameAsCurrent) {
      return res.render('change-password', { error: 'La nueva contraseña no puede ser igual a la actual', message: null, user });
    }

    await User.updateUserPassword(userId, newPassword);
    return res.render('change-password', { error: null, message: 'Contraseña actualizada correctamente', user });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    const user = await User.getUserById(req.session.userId);
    return res.render('change-password', { error: 'Error al cambiar contraseña', message: null, user });
  }
};

module.exports = {
  registerController,
  loginController,
  logoutController,
  showProfile,
  updateProfile,
  showChangePassword,
  changePassword
};
