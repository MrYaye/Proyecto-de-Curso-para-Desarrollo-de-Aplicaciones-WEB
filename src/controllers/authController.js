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
      errorProfile: null,
      errorPassword: null,
      messageProfile: null,
      messagePassword: null
    });
  } catch (error) {
    console.error('Error al cargar perfil:', error);
    return res.render('profile', {
      error: 'Error al cargar perfil',
      errorProfile: null,
      errorPassword: null,
      messageProfile: null,
      messagePassword: null,
      user: null
    });
  }
};

// Actualizar perfil
const updateProfile = async (req, res) => {
  try {
    const { nombre, email, telefono, currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.session.userId;

    const hasPasswordFields = Object.prototype.hasOwnProperty.call(req.body, 'currentPassword') ||
      Object.prototype.hasOwnProperty.call(req.body, 'newPassword') ||
      Object.prototype.hasOwnProperty.call(req.body, 'confirmNewPassword');
    const hasProfileFields = Object.prototype.hasOwnProperty.call(req.body, 'nombre') ||
      Object.prototype.hasOwnProperty.call(req.body, 'email') ||
      Object.prototype.hasOwnProperty.call(req.body, 'telefono');

    // Si el usuario envía SOLO campos de contraseña (sin editar perfil), manejar solo el cambio de contraseña
    if (hasPasswordFields && !hasProfileFields) {
      const userWithPassword = await User.getUserByIdWithPassword(userId);

      if (!currentPassword || !newPassword || !confirmNewPassword) {
        const user = await User.getUserById(userId);
        return res.render('profile', {
          user,
          error: null,
          errorProfile: null,
          errorPassword: 'Todos los campos de contraseña son obligatorios',
          messageProfile: null,
          messagePassword: null
        });
      }

      if (newPassword !== confirmNewPassword) {
        const user = await User.getUserById(userId);
        return res.render('profile', {
          user,
          error: null,
          errorProfile: null,
          errorPassword: 'Las nuevas contraseñas no coinciden',
          messageProfile: null,
          messagePassword: null
        });
      }

      // Verificar contraseña actual
      const isValid = await User.verifyPassword(currentPassword, userWithPassword.password);
      if (!isValid) {
        const user = await User.getUserById(userId);
        return res.render('profile', {
          user,
          error: null,
          errorProfile: null,
          errorPassword: 'Contraseña actual incorrecta',
          messageProfile: null,
          messagePassword: null
        });
      }

      // Validación mínima de seguridad
      if (newPassword.length < 8) {
        const user = await User.getUserById(userId);
        return res.render('profile', {
          user,
          error: null,
          errorProfile: null,
          errorPassword: 'La nueva contraseña debe tener al menos 8 caracteres',
          messageProfile: null,
          messagePassword: null
        });
      }

      const isSameAsCurrent = await User.verifyPassword(newPassword, userWithPassword.password);
      if (isSameAsCurrent) {
        const user = await User.getUserById(userId);
        return res.render('profile', {
          user,
          error: null,
          errorProfile: null,
          errorPassword: 'La nueva contraseña no puede ser igual a la actual',
          messageProfile: null,
          messagePassword: null
        });
      }

      await User.updateUserPassword(userId, newPassword);
      const updatedUser = await User.getUserById(userId);
      return res.render('profile', {
        user: updatedUser,
        error: null,
        errorProfile: null,
        errorPassword: null,
        messageProfile: null,
        messagePassword: 'Contraseña actualizada correctamente'
      });
    }

    // Si llega aquí, se espera que el usuario esté editando el perfil (con o sin cambio de contraseña)
    if (!nombre || !email) {
      const user = await User.getUserById(userId);
      return res.render('profile', {
        user,
        error: null,
        errorProfile: 'El nombre y email son obligatorios',
        errorPassword: null,
        messageProfile: null,
        messagePassword: null
      });
    }

    const existingUser = await User.getUserByEmail(email);
    if (existingUser && existingUser.id !== userId) {
      const user = await User.getUserById(userId);
      return res.render('profile', {
        user,
        error: null,
        errorProfile: 'El email ya está en uso',
        errorPassword: null,
        messageProfile: null,
        messagePassword: null
      });
    }

    await User.updateUserProfile(userId, nombre, email, telefono);
    req.session.userName = nombre;

    // Si se enviaron campos de contraseña, procesarlos
    if (currentPassword || newPassword || confirmNewPassword) {
      const userWithPassword = await User.getUserByIdWithPassword(userId);
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        const updatedUser = await User.getUserById(userId);
        return res.render('profile', {
          user: updatedUser,
          error: null,
          errorProfile: null,
          errorPassword: 'Todos los campos de contraseña son obligatorios',
          messageProfile: 'Perfil actualizado correctamente',
          messagePassword: null
        });
      }

      if (newPassword !== confirmNewPassword) {
        const updatedUser = await User.getUserById(userId);
        return res.render('profile', {
          user: updatedUser,
          error: null,
          errorProfile: null,
          errorPassword: 'Las nuevas contraseñas no coinciden',
          messageProfile: 'Perfil actualizado correctamente',
          messagePassword: null
        });
      }

      // Verificar contraseña actual
      const isValid = await User.verifyPassword(currentPassword, userWithPassword.password);
      if (!isValid) {
        const updatedUser = await User.getUserById(userId);
        return res.render('profile', {
          user: updatedUser,
          error: null,
          errorProfile: null,
          errorPassword: 'Contraseña actual incorrecta',
          messageProfile: 'Perfil actualizado correctamente',
          messagePassword: null
        });
      }

      // Validación mínima de seguridad
      if (newPassword.length < 8) {
        const updatedUser = await User.getUserById(userId);
        return res.render('profile', {
          user: updatedUser,
          error: null,
          errorProfile: null,
          errorPassword: 'La nueva contraseña debe tener al menos 8 caracteres',
          messageProfile: 'Perfil actualizado correctamente',
          messagePassword: null
        });
      }

      const isSameAsCurrent = await User.verifyPassword(newPassword, userWithPassword.password);
      if (isSameAsCurrent) {
        const updatedUser = await User.getUserById(userId);
        return res.render('profile', {
          user: updatedUser,
          error: null,
          errorProfile: null,
          errorPassword: 'La nueva contraseña no puede ser igual a la actual',
          messageProfile: 'Perfil actualizado correctamente',
          messagePassword: null
        });
      }

      await User.updateUserPassword(userId, newPassword);
      const updatedUser = await User.getUserById(userId);
      return res.render('profile', {
        user: updatedUser,
        error: null,
        errorProfile: null,
        errorPassword: null,
        messageProfile: 'Perfil actualizado correctamente',
        messagePassword: 'Contraseña actualizada correctamente'
      });
    }

    const updatedUser = await User.getUserById(userId);
    return res.render('profile', {
      user: updatedUser,
      error: null,
      errorProfile: null,
      errorPassword: null,
      messageProfile: 'Perfil actualizado correctamente',
      messagePassword: null
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    const user = await User.getUserById(req.session.userId);
    return res.render('profile', {
      user,
      error: 'Error al actualizar perfil',
      errorProfile: null,
      errorPassword: null,
      messageProfile: null,
      messagePassword: null
    });
  }
};

module.exports = {
  registerController,
  loginController,
  logoutController,
  showProfile,
  updateProfile
};
