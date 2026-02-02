# Blog Authentication System

This Astro blog now includes a complete authentication system with SQLite3 database and role-based permissions.

## Features

- ✅ SQLite3 database with human-centric schema
- ✅ Express backend with session-based authentication
- ✅ Role-based access control (RBAC)
- ✅ User registration and login
- ✅ Permission-based UI elements
- ✅ Secure password hashing with bcrypt

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and set a secure `SESSION_SECRET`.

### 3. Run Both Servers

Start both the Astro dev server and the Express backend:

```bash
pnpm run dev:all
```

Or run them separately:

```bash
# Terminal 1 - Astro frontend
pnpm run dev

# Terminal 2 - Express backend
pnpm run server
```

- Frontend: http://localhost:4321
- Backend API: http://localhost:3000

## Database Schema

The database follows a human-centric design:

- **humans**: Base table for all people
- **customers**: Authentication (username, password)
- **email_history**: Temporal email tracking
- **site_roles**: RBAC roles (admin, editor, author, customer)
- **permissions**: Granular permissions (blog.create, blog.edit, etc.)
- **human_site_roles**: User ↔ Role assignments
- **site_role_permissions**: Role ↔ Permission assignments

## Default Admin Account

The database is seeded with a default admin account:

- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `hilliards@gmail.com`
- **Permissions**: All permissions (admin role)

**⚠️ Change this password in production!**

## Permissions

The system includes the following permissions:

- `blog.create` - Create new blog posts
- `blog.edit` - Edit blog posts
- `blog.delete` - Delete blog posts
- `blog.publish` - Publish blog posts
- `user.manage` - Manage users
- `product.manage` - Manage products

## How It Works

### Navigation

The Navbar displays different options based on user permissions:

- **"Add Blog"** link appears only if user has `blog.create` permission
- **Login/Logout** buttons appear based on authentication status

### Authentication Flow

1. User registers at `/register` or logs in at `/login`
2. Express server validates credentials and creates session
3. Session cookie is sent with each request
4. Layout component fetches user permissions on each page load
5. UI elements conditionally render based on permissions

### API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user and permissions
- `GET /api/auth/permissions` - Get user permissions

## Project Structure

```
├── db/
│   ├── db.js              # Database helper functions
│   ├── schema.sql         # Database schema
│   ├── seed.sql           # Seed data
│   ├── blog.db            # SQLite database (created on first run)
│   └── sessions.db        # Session store (created on first run)
├── src/
│   ├── components/
│   │   └── Navbar.astro   # Navigation with permission checks
│   ├── layouts/
│   │   └── Layout.astro   # Main layout with auth context
│   ├── pages/
│   │   ├── login.astro    # Login page
│   │   ├── register.astro # Registration page
│   │   └── api/
│   │       └── auth/
│   │           └── me.ts  # Astro API proxy to backend
└── server.js              # Express backend server
```

## Adding More Permissions

To add new permissions:

1. Insert into `permissions` table:

```sql
INSERT INTO permissions (permission_name, resource, action, description)
VALUES ('blog.moderate', 'blog', 'moderate', 'Moderate blog comments');
```

2. Assign to roles:

```sql
INSERT INTO site_role_permissions (site_role_id, permission_id)
VALUES (
  (SELECT id FROM site_roles WHERE role_name = 'editor'),
  (SELECT id FROM permissions WHERE permission_name = 'blog.moderate')
);
```

3. Check permission in code:

```astro
const canModerate = permissions.includes("blog.moderate");
```

## Security Notes

- Passwords are hashed with bcrypt (cost factor 10)
- Sessions are stored in SQLite with secure cookies
- CORS is configured for localhost development
- Foreign keys are enforced
- SQL injection protection via parameterized queries

## Production Deployment

Before deploying to production:

1. Change `SESSION_SECRET` to a secure random value
2. Set `NODE_ENV=production`
3. Update CORS origin to your production domain
4. Enable HTTPS and set `cookie.secure = true`
5. Change the default admin password
6. Consider using PostgreSQL instead of SQLite for better concurrency

## Next Steps

- Implement the `/add-blog` page with permission checks
- Add profile management
- Add password reset functionality
- Implement more granular permissions
- Add email verification
