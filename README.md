# Sistema de Reservas de Restaurante

Un sistema de reservas completo para restaurante construido con **Node.js**, **Express.js**, **EJS** y **MySQL**.

## Características actuales

✅ **Autenticación y roles**
- Registro e inicio de sesión de usuarios
- Contraseñas seguras con bcrypt
- Roles `client` y `admin`
- Panel de administrador separado

✅ **Gestión de reservas**
- Crear nuevas reservas con selección de mesa disponible
- Ver reservas propias y su historial
- Cancelar reservas directamente desde la vista del usuario
- Exportar reservas a CSV y PDF

✅ **Panel de administración mejorado**
- Ver todas las reservas del sistema
- Confirmar, completar y cancelar reservas
- Filtrar reservas por fecha
- Dashboard con estadísticas de reservas, mesas y usuarios

✅ **Gestión completa de mesas**
- Crear, editar y eliminar mesas desde el panel admin
- Mostrar capacidad y ocupación actual
- Indicadores de estado de mesa (`disponible`, `reservada`, `ocupada`)

✅ **Notificaciones tipo toast**
- Mensajes de confirmación y error en UI con toasts
- Eliminación de alertas estáticas para una experiencia más limpia

✅ **Interfaz responsiva**
- Diseño adaptado a dispositivos móviles
- Scroll horizontal seguro en tablas en dispositivos pequeños
- Menús y formularios adaptativos

## Stack tecnológico

- Node.js
- Express.js
- EJS
- MySQL
- bcrypt
- express-session
- mysql2
- express-validator
- pdfkit
- dotenv

## Requisitos previos

Asegúrate de tener instalado:

- **Node.js** (v14+)
- **npm**
- **MySQL**

## Instalación

1. Clona o abre el proyecto:

```bash
cd "Proyecto-de-Curso"
```

2. Instala dependencias:

```bash
npm install
```

3. Configura la base de datos

Puedes usar los scripts SQL incluidos en la carpeta `database/` para crear la base de datos y las tablas.

4. Configura variables de entorno

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus datos:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=restaurant_reservations
DB_PORT=3306
PORT=3000
NODE_ENV=development
SESSION_SECRET=tu_clave_secreta_aqui
```

## Configurar usuario admin

Si necesitas crear o actualizar un admin, ejecuta:

```bash
node setup-admin.js
```

El script crea o actualiza el usuario con email `brian@email.com`, contraseña `123456` y rol `admin`.

## Ejecución

### Modo desarrollo

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

Abre `http://localhost:3000` en tu navegador.

## Estructura del proyecto

```
Proyecto-de-Curso/
├── src/
│   ├── index.js
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   └── reservationController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── database.js
│   │   ├── Reservation.js
│   │   ├── Table.js
│   │   └── User.js
│   └── routes/
│       ├── adminRoutes.js
│       ├── authRoutes.js
│       └── reservationRoutes.js
├── views/
│   ├── admin/
│   │   ├── dashboard.ejs
│   │   ├── reservations-by-date.ejs
│   │   ├── reservations-list.ejs
│   │   └── tables-management.ejs
│   ├── partials/
│   │   └── navbar.ejs
│   ├── reservations/
│   │   ├── edit.ejs
│   │   ├── my-reservations.ejs
│   │   ├── new.ejs
│   │   └── success.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── profile.ejs
│   └── index.ejs
├── public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── database/
│   ├── init-tables.sql
│   └── setup-database.sql
├── package.json
├── README.md
├── setup-admin.js
└── .env.example
```

## Uso de la aplicación

### Cliente

1. Regístrate en `/register`
2. Inicia sesión en `/login`
3. Crea nuevas reservas en `/reservations/new`
4. Revisa tus reservas en `/reservations/my-reservations`
5. Cancela reservas pendientes o confirmadas

### Administrador

1. Accede al panel en `/admin/dashboard`
2. Gestiona reservas y mesas
3. Confirma, completa o cancela reservas
4. Filtra reservas por fecha

## Notas adicionales

- La interfaz usa notificaciones tipo toast para mensajes de éxito y error.
- Las tablas grandes mantienen scroll horizontal en móviles.
- El panel admin permite CRUD completo de mesas con indicadores de ocupación.

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
