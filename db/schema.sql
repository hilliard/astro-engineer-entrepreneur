-- Human-Centric Database Schema

-- Base entity for all people
CREATE TABLE IF NOT EXISTS humans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    dob TEXT,
    gender TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customers role table
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    human_id INTEGER NOT NULL UNIQUE,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    loyalty_points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (human_id) REFERENCES humans(id) ON DELETE CASCADE
);

-- Employees role table
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    human_id INTEGER NOT NULL UNIQUE,
    job_title TEXT,
    department TEXT,
    salary REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (human_id) REFERENCES humans(id) ON DELETE CASCADE
);

-- Artists role table
CREATE TABLE IF NOT EXISTS artists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    human_id INTEGER NOT NULL UNIQUE,
    stage_name TEXT,
    bio TEXT,
    website TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (human_id) REFERENCES humans(id) ON DELETE CASCADE
);

-- Email history (temporal tracking)
CREATE TABLE IF NOT EXISTS email_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    human_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    effective_from DATETIME DEFAULT CURRENT_TIMESTAMP,
    effective_to DATETIME,
    is_current BOOLEAN DEFAULT 1,
    FOREIGN KEY (human_id) REFERENCES humans(id) ON DELETE CASCADE
);

-- RBAC: Site roles
CREATE TABLE IF NOT EXISTS site_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- RBAC: Permissions
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    permission_name TEXT UNIQUE NOT NULL,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many: Humans to Site Roles
CREATE TABLE IF NOT EXISTS human_site_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    human_id INTEGER NOT NULL,
    site_role_id INTEGER NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (human_id) REFERENCES humans(id) ON DELETE CASCADE,
    FOREIGN KEY (site_role_id) REFERENCES site_roles(id) ON DELETE CASCADE,
    UNIQUE(human_id, site_role_id)
);

-- Many-to-many: Site Roles to Permissions
CREATE TABLE IF NOT EXISTS site_role_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_role_id) REFERENCES site_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE(site_role_id, permission_id)
);

-- Cart items (updated to reference human_id)
CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    human_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (human_id) REFERENCES humans(id) ON DELETE CASCADE
);

-- Sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expire DATETIME NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_history_human ON email_history(human_id);
CREATE INDEX IF NOT EXISTS idx_email_history_current ON email_history(is_current);
CREATE INDEX IF NOT EXISTS idx_human_site_roles_human ON human_site_roles(human_id);
CREATE INDEX IF NOT EXISTS idx_human_site_roles_role ON human_site_roles(site_role_id);
CREATE INDEX IF NOT EXISTS idx_site_role_permissions_role ON site_role_permissions(site_role_id);
CREATE INDEX IF NOT EXISTS idx_site_role_permissions_perm ON site_role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_human ON cart_items(human_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);
