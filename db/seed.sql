-- Seed data for roles and permissions

-- Insert default site roles
INSERT INTO site_roles (role_name, description) VALUES
    ('admin', 'Full system access with all permissions'),
    ('editor', 'Can create and edit content'),
    ('author', 'Can create own content'),
    ('customer', 'Standard customer access');

-- Insert permissions
INSERT INTO permissions (permission_name, resource, action, description) VALUES
    ('blog.create', 'blog', 'create', 'Create new blog posts'),
    ('blog.edit', 'blog', 'edit', 'Edit blog posts'),
    ('blog.delete', 'blog', 'delete', 'Delete blog posts'),
    ('blog.publish', 'blog', 'publish', 'Publish blog posts'),
    ('user.manage', 'user', 'manage', 'Manage users'),
    ('product.manage', 'product', 'manage', 'Manage products');

-- Assign permissions to admin role (gets all permissions)
INSERT INTO site_role_permissions (site_role_id, permission_id)
SELECT 
    (SELECT id FROM site_roles WHERE role_name = 'admin'),
    id
FROM permissions;

-- Assign permissions to editor role
INSERT INTO site_role_permissions (site_role_id, permission_id)
SELECT 
    (SELECT id FROM site_roles WHERE role_name = 'editor'),
    id
FROM permissions
WHERE permission_name IN ('blog.create', 'blog.edit', 'blog.publish');

-- Assign permissions to author role
INSERT INTO site_role_permissions (site_role_id, permission_id)
SELECT 
    (SELECT id FROM site_roles WHERE role_name = 'author'),
    id
FROM permissions
WHERE permission_name IN ('blog.create', 'blog.edit');

-- Create default admin user
-- Password: admin123 (bcrypt hashed)
INSERT INTO humans (first_name, last_name, dob, gender, phone) VALUES
    ('Admin', 'User', '1990-01-01', 'other', '555-0100');

INSERT INTO email_history (human_id, email, is_current) VALUES
    (1, 'hilliards@gmail.com', 1);

INSERT INTO customers (human_id, username, password_hash, loyalty_points) VALUES
    (1, 'admin', '$2b$10$rQZ5YZz5ZxK5KqN5Z5ZxK5ZxK5ZxK5ZxK5ZxK5ZxK5ZxK5ZxK5Zx', 0);

INSERT INTO human_site_roles (human_id, site_role_id)
SELECT 1, id FROM site_roles WHERE role_name = 'admin';
