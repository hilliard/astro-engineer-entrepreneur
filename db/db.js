import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'blog.db');

let db = null;

/**
 * Get database connection (singleton pattern)
 * @returns {Promise<Database>} SQLite database connection
 */
export async function getDBConnection() {
  if (db) {
    return db;
  }

  const isNewDB = !fs.existsSync(DB_PATH);

  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON');

  // Initialize database if it's new
  if (isNewDB) {
    console.log('Initializing new database...');
    await initializeDatabase();
  }

  return db;
}

/**
 * Initialize database with schema and seed data
 */
async function initializeDatabase() {
  try {
    // Read and execute schema
    const schemaSQL = fs.readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    await db.exec(schemaSQL);
    console.log('✓ Database schema created');

    // Read and execute seed data
    const seedSQL = fs.readFileSync(join(__dirname, 'seed.sql'), 'utf-8');
    await db.exec(seedSQL);
    console.log('✓ Database seeded');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Get current email for a human
 * @param {number} humanId - The human ID
 * @returns {Promise<string|null>} Current email or null
 */
export async function getCurrentEmail(humanId) {
  const db = await getDBConnection();
  const result = await db.get(
    'SELECT email FROM email_history WHERE human_id = ? AND is_current = 1',
    [humanId]
  );
  return result?.email || null;
}

/**
 * Get user permissions
 * @param {number} humanId - The human ID
 * @returns {Promise<string[]>} Array of permission names
 */
export async function getUserPermissions(humanId) {
  const db = await getDBConnection();
  const permissions = await db.all(
    `SELECT DISTINCT p.permission_name 
     FROM permissions p
     JOIN site_role_permissions srp ON p.id = srp.permission_id
     JOIN site_roles sr ON sr.id = srp.site_role_id
     JOIN human_site_roles hsr ON hsr.site_role_id = sr.id
     WHERE hsr.human_id = ?`,
    [humanId]
  );
  return permissions.map((p) => p.permission_name);
}

/**
 * Check if user has a specific permission
 * @param {number} humanId - The human ID
 * @param {string} permissionName - The permission name to check
 * @returns {Promise<boolean>} True if user has permission
 */
export async function hasPermission(humanId, permissionName) {
  const permissions = await getUserPermissions(humanId);
  return permissions.includes(permissionName);
}

/**
 * Get user by username
 * @param {string} username - The username
 * @returns {Promise<Object|null>} User object or null
 */
export async function getUserByUsername(username) {
  const db = await getDBConnection();
  const customer = await db.get(
    `SELECT c.*, h.* 
     FROM customers c
     JOIN humans h ON c.human_id = h.id
     WHERE c.username = ?`,
    [username]
  );
  
  if (!customer) return null;

  const email = await getCurrentEmail(customer.human_id);
  
  return {
    id: customer.human_id,
    username: customer.username,
    password_hash: customer.password_hash,
    first_name: customer.first_name,
    last_name: customer.last_name,
    email,
  };
}

/**
 * Get user by ID
 * @param {number} humanId - The human ID
 * @returns {Promise<Object|null>} User object or null
 */
export async function getUserById(humanId) {
  const db = await getDBConnection();
  const human = await db.get(
    'SELECT * FROM humans WHERE id = ?',
    [humanId]
  );
  
  if (!human) return null;

  const email = await getCurrentEmail(humanId);
  const customer = await db.get(
    'SELECT username FROM customers WHERE human_id = ?',
    [humanId]
  );
  
  return {
    id: human.id,
    username: customer?.username,
    first_name: human.first_name,
    last_name: human.last_name,
    email,
  };
}

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<number>} The new human ID
 */
export async function createUser(userData) {
  const db = await getDBConnection();
  const { username, password_hash, email, first_name, last_name } = userData;

  try {
    await db.run('BEGIN TRANSACTION');

    // Insert human
    const humanResult = await db.run(
      `INSERT INTO humans (first_name, last_name) VALUES (?, ?)`,
      [first_name, last_name]
    );
    const humanId = humanResult.lastID;

    // Insert email
    await db.run(
      `INSERT INTO email_history (human_id, email, is_current) VALUES (?, ?, 1)`,
      [humanId, email]
    );

    // Insert customer
    await db.run(
      `INSERT INTO customers (human_id, username, password_hash) VALUES (?, ?, ?)`,
      [humanId, username, password_hash]
    );

    // Assign default customer role
    const roleResult = await db.get(
      `SELECT id FROM site_roles WHERE role_name = 'customer'`
    );
    await db.run(
      `INSERT INTO human_site_roles (human_id, site_role_id) VALUES (?, ?)`,
      [humanId, roleResult.id]
    );

    await db.run('COMMIT');
    return humanId;
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
}

/**
 * Close database connection
 */
export async function closeDB() {
  if (db) {
    await db.close();
    db = null;
  }
}
