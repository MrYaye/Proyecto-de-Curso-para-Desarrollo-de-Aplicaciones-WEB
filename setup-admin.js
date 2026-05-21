const pool = require('./src/config/database');
const bcrypt = require('bcrypt');

const setupAdmin = async () => {
  const connection = await pool.getConnection();
  try {
    console.log('Buscando usuario admin...');
    
    // Verificar si existe
    const [rows] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      ['brian@email.com']
    );

    const hashedPassword = await bcrypt.hash('123456', 10);

    if (rows.length === 0) {
      // Crear nuevo usuario admin
      console.log('Creando usuario admin...');
      await connection.query(
        'INSERT INTO users (nombre, email, password, telefono, rol) VALUES (?, ?, ?, ?, ?)',
        ['Brian Admin', 'brian@email.com', hashedPassword, '+56123456789', 'admin']
      );
      console.log('✓ Usuario admin creado exitosamente');
      console.log('  Email: brian@email.com');
      console.log('  Contraseña: 123456');
      console.log('  Rol: admin');
    } else {
      // Actualizar usuario existente
      const user = rows[0];
      console.log(`Actualizando usuario: ${user.email}`);
      
      await connection.query(
        'UPDATE users SET password = ?, rol = ? WHERE id = ?',
        [hashedPassword, 'admin', user.id]
      );
      console.log('✓ Usuario actualizado exitosamente');
      console.log(`  Email: ${user.email}`);
      console.log('  Contraseña: 123456');
      console.log('  Rol: admin');
    }

    // Mostrar todos los usuarios
    console.log('\n--- Usuarios en la base de datos ---');
    const [allUsers] = await connection.query('SELECT id, nombre, email, rol FROM users');
    allUsers.forEach(u => {
      console.log(`  ID: ${u.id} | ${u.nombre} | ${u.email} | Rol: ${u.rol}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
};

setupAdmin();
