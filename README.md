# Sistema de Reservas de Restaurante

Un sistema completo de reservas para restaurante construido con **Node.js**, **Express.js**, **EJS**, y **MySQL**.

## Características

✅ **Autenticación de Usuarios**
- Registro e inicio de sesión seguros
- Contraseñas encriptadas con bcrypt

✅ **Gestión de Reservas**
- Crear nuevas reservas
- Ver historial de reservas personales
- Cancelar reservas

✅ **Panel de Administración**
- Ver todas las reservas del sistema
- Confirmar, completar o cancelar reservas
- Gestionar disponibilidad de mesas
- Filtrar reservas por fecha
- Dashboard con estadísticas

✅ **Disponibilidad de Mesas**
- Sistema inteligente de búsqueda de mesas disponibles
- Verificación automática de conflictos
- Filtrado por capacidad

✅ **Interfaz Responsiva**
- Diseño mobile-friendly
- Interfaz intuitiva y fácil de usar

## Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

- **Node.js** (versión 14 o superior)
- **npm** (gestor de paquetes de Node.js)
- **MySQL** (versión 5.7 o superior)

## Instalación

### 1. Clonar o Descargar el Proyecto

```bash
cd Proyecto-de-Curso
```

### 2. Instalar Dependencias

```bash
npm install
```

Las siguientes dependencias se instalarán:
- **express**: Framework web
- **mysql2**: Driver de MySQL
- **ejs**: Motor de plantillas
- **bcrypt**: Encriptación de contraseñas
- **express-session**: Gestión de sesiones
- **dotenv**: Variables de entorno
- **cookie-parser**: Parseo de cookies
- **nodemon**: Herramienta de desarrollo (dev)

### 3. Configurar la Base de Datos

#### Crear la base de datos en MySQL:

```sql
CREATE DATABASE restaurant_reservations;
```

#### O utilizar el script SQL incluido (opcional):

```bash
mysql -u root -p < database/init.sql
```

### 4. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=restaurant_reservations
DB_PORT=3306

# Configuración del Servidor
PORT=3000
NODE_ENV=development

# Sesiones
SESSION_SECRET=tu_clave_secreta_aqui
```

**Nota**: Asegúrate de cambiar `SESSION_SECRET` en producción.

## Ejecutar la Aplicación

### Modo Desarrollo (con auto-recarga)

```bash
npm run dev
```

### Modo Producción

```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
Proyecto-de-Curso/
├── src/
│   ├── index.js                 # Archivo principal del servidor
│   ├── config/
│   │   └── database.js          # Configuración de conexión MySQL
│   ├── models/
│   │   ├── database.js          # Inicialización de tablas
│   │   ├── User.js              # Modelo de usuarios
│   │   ├── Reservation.js       # Modelo de reservas
│   │   └── Table.js             # Modelo de mesas
│   ├── controllers/
│   │   ├── authController.js    # Lógica de autenticación
│   │   ├── reservationController.js # Lógica de reservas
│   │   └── adminController.js   # Lógica de admin
│   ├── routes/
│   │   ├── authRoutes.js        # Rutas de autenticación
│   │   ├── reservationRoutes.js # Rutas de reservas
│   │   └── adminRoutes.js       # Rutas de admin
│   └── middleware/
│       └── auth.js              # Middleware de autenticación
├── views/
│   ├── index.ejs                # Página de inicio
│   ├── login.ejs                # Página de login
│   ├── register.ejs             # Página de registro
│   ├── partials/
│   │   └── navbar.ejs           # Barra de navegación
│   ├── reservations/
│   │   ├── new.ejs              # Crear nueva reserva
│   │   ├── my-reservations.ejs  # Ver mis reservas
│   │   └── success.ejs          # Confirmación de reserva
│   └── admin/
│       ├── dashboard.ejs        # Dashboard admin
│       ├── reservations-list.ejs # Listar todas las reservas
│       ├── reservations-by-date.ejs # Reservas por fecha
│       └── tables-management.ejs # Gestionar mesas
├── public/
│   ├── css/
│   │   └── style.css            # Estilos CSS
│   └── js/
│       └── (scripts JavaScript si es necesario)
├── package.json                 # Dependencias del proyecto
├── .env.example                 # Ejemplo de variables de entorno
├── .gitignore                   # Archivos a ignorar en Git
└── README.md                    # Este archivo

```

## Uso de la Aplicación

### Para Clientes

1. **Registrarse**: Ve a `/register` y crea una cuenta
2. **Iniciar Sesión**: Inicia sesión con tus credenciales
3. **Nueva Reserva**: Ve a "Nueva Reserva" y sigue estos pasos:
   - Selecciona la fecha
   - Selecciona la hora
   - Indica el número de personas
   - Selecciona una mesa disponible
   - Agrega observaciones si es necesario
   - Confirma la reserva
4. **Ver Reservas**: Ve a "Mis Reservas" para ver todas tus reservas
5. **Cancelar Reserva**: En "Mis Reservas", puedes cancelar reservas pendientes o confirmadas

### Para Administradores

**Acceso al Panel Admin**:
- El acceso se otorga directamente en la base de datos
- Modifica el rol del usuario a `'admin'` en la tabla `users`:

```sql
UPDATE users SET rol = 'admin' WHERE email = 'tu_email@example.com';
```

**Funciones del Admin**:
1. **Dashboard**: Ver estadísticas generales
2. **Gestionar Reservas**: 
   - Ver todas las reservas
   - Confirmar reservas pendientes
   - Marcar como completadas
   - Cancelar reservas
3. **Ver por Fecha**: Filtrar reservas por fecha específica
4. **Gestionar Mesas**: Ver todas las mesas y su estado

## Credenciales de Prueba

Para probar la aplicación, puedes usar estas credenciales después de registrarte:

- **Usuario**: Tu email registrado
- **Contraseña**: La que ingresaste al registrarte

## Tablas de la Base de Datos

### Tabla `users`
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  rol ENUM('client', 'admin') DEFAULT 'client',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabla `mesas`
```sql
CREATE TABLE mesas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_mesa INT UNIQUE NOT NULL,
  capacidad INT NOT NULL,
  ubicacion VARCHAR(50),
  estado ENUM('disponible', 'ocupada', 'reservada') DEFAULT 'disponible',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla `reservas`
```sql
CREATE TABLE reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  mesa_id INT NOT NULL,
  fecha_reserva DATE NOT NULL,
  hora_reserva TIME NOT NULL,
  numero_personas INT NOT NULL,
  observaciones TEXT,
  estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') DEFAULT 'pendiente',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (mesa_id) REFERENCES mesas(id) ON DELETE CASCADE,
  INDEX(fecha_reserva),
  INDEX(usuario_id),
  UNIQUE KEY unique_mesa_datetime (mesa_id, fecha_reserva, hora_reserva)
);
```

## Pruebas Rápidas

### 1. Crear un Usuario Admin Directamente

Después de que el servidor cree las tablas, ejecuta en MySQL:

```sql
-- Insertar mesas de prueba
INSERT INTO mesas (numero_mesa, capacidad, ubicacion) VALUES 
(1, 2, 'Ventana'),
(2, 4, 'Centro'),
(3, 6, 'Terraza'),
(4, 4, 'Rincón');

-- Crear un usuario admin (contraseña encriptada con bcrypt de "admin123")
INSERT INTO users (nombre, email, password, telefono, rol) VALUES 
('Admin', 'admin@restaurant.com', '$2b$10$YourHashedPasswordHere', '1234567890', 'admin');
```

### 2. Flujo de Prueba Completo

1. Inicia el servidor con `npm run dev`
2. Abre `http://localhost:3000`
3. Regístrate con un nuevo usuario
4. Haz una reserva
5. Verifica tu reserva en "Mis Reservas"
6. Accede como admin (si configuraste uno)
7. Confirma la reserva desde el panel admin

## Resolución de Problemas

### Error de Conexión a MySQL
- Verifica que MySQL esté ejecutándose
- Revisa las credenciales en el archivo `.env`
- Asegúrate de que la base de datos existe

### Puertos en Uso
Si el puerto 3000 está en uso, cambialo en el archivo `.env`:
```env
PORT=3001
```

### Sesiones no Funcionan
- Reinicia el servidor
- Borra las cookies del navegador
- Verifica que `SESSION_SECRET` esté definido en `.env`

## Seguridad en Producción

Antes de desplegar a producción:

1. **Cambiar SESSION_SECRET** a una cadena segura
2. **Usar HTTPS**: Cambiar `secure: true` en session config
3. **Validaciones**: Agregar más validaciones de entrada
4. **Variables de Entorno**: Usar variables seguras
5. **Backups**: Realizar backups regulares de la BD
6. **Rate Limiting**: Implementar limitación de velocidad
7. **CORS**: Configurar CORS apropiadamente

## Mejoras Futuras

- [ ] Confirmación por email
- [ ] Sistema de calificaciones
- [ ] Integración con pasarela de pago
- [ ] Notificaciones SMS
- [ ] Sistema de descuentos/promociones
- [ ] Reportes PDF
- [ ] API REST para aplicación móvil
- [ ] Tests automatizados

## Licencia

Este proyecto está bajo la licencia ISC.

## Autor

Desarrollado como proyecto de curso.

## Soporte

Si encuentras problemas, por favor:
1. Revisa el archivo README
2. Verifica la consola del navegador y del servidor
3. Consulta la documentación de las dependencias

---

**¡Disfruta usando el Sistema de Reservas de Restaurante!** 🍽️
