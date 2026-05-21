-- Mesas de Prueba para el Sistema de Reservas
-- Ejecuta este script después de que el servidor haya creado las tablas

-- Insertar mesas
INSERT INTO mesas (numero_mesa, capacidad, ubicacion) VALUES 
(1, 2, 'Ventana Frontal'),
(2, 2, 'Ventana Lateral'),
(3, 4, 'Centro Izquierda'),
(4, 4, 'Centro Derecha'),
(5, 6, 'Terraza'),
(6, 6, 'Rincón Privado'),
(7, 4, 'Entrada'),
(8, 2, 'Barra');

-- Nota: Para crear un usuario admin, primero debes registrarte en la aplicación web
-- Luego ejecuta este comando para convertir tu usuario en admin:
-- UPDATE users SET rol = 'admin' WHERE email = 'tu_email@example.com';

-- Ejemplo de usuario admin (debes generar el hash bcrypt de la contraseña):
-- Para generar el hash, usa: bcrypt('admin123', 10)
-- INSERT INTO users (nombre, email, password, telefono, rol) VALUES 
-- ('Administrador', 'admin@restaurant.com', '$2b$10$...' , '1234567890', 'admin');
