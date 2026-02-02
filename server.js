import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import cors from 'cors';
import ConnectSqlite3 from 'connect-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getDBConnection,
  getUserByUsername,
  getUserById,
  createUser,
  getUserPermissions,
  getCurrentEmail,
  hasPermission,
} from './db/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Session store
const SQLiteStore = ConnectSqlite3(session);

// Middleware
app.use(cors({
  origin: 'http://localhost:4321', // Astro dev server
  credentials: true,
}));
app.use(express.json());
app.use(
  session({
    store: new SQLiteStore({
      db: 'sessions.db',
      dir: './db',
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  })
);

// Auth middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, email, first_name, last_name } = req.body;

    // Validation
    if (!username || !password || !email || !first_name || !last_name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if username exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const humanId = await createUser({
      username,
      password_hash,
      email,
      first_name,
      last_name,
    });

    // Set session
    req.session.userId = humanId;

    res.status(201).json({
      message: 'User created successfully',
      user: { id: humanId, username, email, first_name, last_name },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Get user
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set session
    req.session.userId = user.id;

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const user = await getUserById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const permissions = await getUserPermissions(user.id);

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      permissions,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Get user permissions
app.get('/api/auth/permissions', requireAuth, async (req, res) => {
  try {
    const permissions = await getUserPermissions(req.session.userId);
    res.json({ permissions });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ error: 'Failed to get permissions' });
  }
});

// Create blog post
app.post('/api/blog/create', requireAuth, async (req, res) => {
  try {
    // Check if user has permission
    const canCreate = await hasPermission(req.session.userId, 'blog.create');
    if (!canCreate) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const { title, description, date, image, tags, content } = req.body;

    // Validation
    if (!title || !description || !date || !image || !tags || !content) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (description.length > 200) {
      return res.status(400).json({ error: 'Description must be 200 characters or less' });
    }

    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags must be an array' });
    }

    // Create slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Create filename
    const filename = `${slug}.md`;
    const blogDir = path.join(__dirname, 'src', 'data', 'blog');
    const filePath = path.join(blogDir, filename);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return res.status(400).json({ error: 'A blog post with this title already exists' });
    }

    // Create frontmatter and content
    const tagsYaml = tags.map(tag => `  - ${tag}`).join('\n');
    const fileContent = `---
title: ${title}
description: ${description}
date: "${date}"
image: "${image}"
tags:
${tagsYaml}
---

${content}
`;

    // Write file
    fs.writeFileSync(filePath, fileContent, 'utf-8');

    res.status(201).json({
      message: 'Blog post created successfully',
      slug: slug,
      filename: filename,
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize database and start server
async function startServer() {
  try {
    await getDBConnection();
    console.log('✓ Database connected');

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ CORS enabled for http://localhost:4321`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
