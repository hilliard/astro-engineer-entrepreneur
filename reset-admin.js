import bcrypt from 'bcrypt';
import { getDBConnection } from './db/db.js';

async function resetAdminPassword() {
  try {
    const db = await getDBConnection();
    
    // Hash the password
    const password = 'admin123';
    const password_hash = await bcrypt.hash(password, 10);
    
    // Update the admin user's password
    await db.run(
      'UPDATE customers SET password_hash = ? WHERE human_id = 1',
      [password_hash]
    );
    
    console.log('✅ Admin password reset successfully!');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Email: hilliards@gmail.com');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  }
}

resetAdminPassword();
