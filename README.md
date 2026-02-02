# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

---

# Adding a New Blog Post to Your Astro Project

Your blog system uses Astro Content Collections, which is a powerful pattern. Here's the step-by-step process:

1. Create a New Markdown File
   Add a new file in blog (e.g., post4.md):

   src/data/blog/post4.md

2. Add Frontmatter Metadata
   Structure it exactly like your existing posts with this required metadata:

```
---
title: "Your Post Title"
description: "Brief summary for preview"
date: "2025-01-30"
image: "/images/posts/post-4.jpg"
tags:
  - Tag1
  - Tag2
  - Tag3
---
```

3. Write Your Content
   Below the frontmatter, add your markdown content (headings, paragraphs, code blocks, etc.)

4. That's It! No Additional Configuration Needed
   Your system automatically handles the rest because:

Dynamic Routes: [slug].astro automatically generates a page for each post using the filename as the slug
Blog Listing: blog.astro uses getCollection('blog') to fetch all posts and renders them via BlogCard.astro
Automatic Updates: Astro detects new files and regenerates without code changes

What Happens Automatically:
✅ Post appears on /blog page with title, date, tags, and description
✅ "Read Article" button links to /blog/post4 (based on filename)
✅ Individual post page renders with image, title, date, and full content

Best Practice Tips:
Keep image filenames consistent (e.g., /images/posts/post-4.jpg)
Use consistent date format (YYYY-MM-DD)
Include 2-3 relevant tags for categorization
Write descriptive summaries (used in the blog preview)

This content-driven approach means your blog scales without touching any component or routing code. Just drop new .md files in the blog folder!

pnpm add @astrojs/node better-sqlite3 bcryptjs express-session connect-sqlite3

📦 What's Been Built
Database Layer
schema.sql - Human-centric database schema with RBAC
seed.sql - Default roles, permissions, and admin user
db.js - Database helper functions
Backend (Express)
server.js - Express server with auth endpoints
Session-based authentication with SQLite session store
Endpoints: login, register, logout, get user, permissions
Frontend (Astro)
login.astro - Login page
register.astro - Registration page
me.ts - API proxy
Layout.astro - Fetches permissions
Navbar.astro - Permission-based UI
Configuration
package.json - Dependencies and scripts
.env.example - Environment template
AUTH_README.md - Complete documentation
🚀 To Get Started
Run these commands:

This starts both servers simultaneously:

Astro: http://localhost:4321
Express: http://localhost:3000

🔑 Default Admin Credentials

Username: admin
Password: admin123
Email: hilliards@gmail.com
The "Add Blog" link will appear in the navbar when logged in as admin (since admin has the blog.create permission).

Username:Labrat
Password: labrat
Email: lab@Rat.com

🎯 Key Features
✅ Role-based permissions (not hardcoded email)
✅ Admin role has blog.create permission
✅ Login/Logout functionality in navbar
✅ Secure session-based auth
✅ Database auto-initializes on first run

The system is ready to use! Check AUTH_README.md for detailed documentation.

What's Been Created

1. add-blog.astro
   A form page with:

Authentication check - Redirects to login if not authenticated
Permission check - Only users with blog.create permission can access
Form fields: title, description (max 200 chars with counter), date, image URL, tags, and markdown content
Client-side validation and real-time character counting
Success/error messaging 2. Backend API Endpoint
Added POST /api/blog/create to server.js:

Permission validation using hasPermission()
Validates all required fields
Creates a slug from the title
Generates a markdown file in blog
Includes proper frontmatter formatting
How to Use
Login with admin credentials (username: admin, password: admin123)
Click "Add Blog" in the navbar (only visible with blog.create permission)
Fill out the form with:
Title
Description (max 200 characters)
Date
Image path (e.g., /images/posts/my-post.jpg)
Tags (comma-separated: JavaScript, React, Tutorial)
Content (Markdown format)
Click "Create Blog Post"
The system creates a .md file in blog
Redirects to /blog on success
The blog post will automatically appear in your blog list thanks to Astro's content collections!
