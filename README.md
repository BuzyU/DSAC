# Data Structure & Algorithm Club (DSAC) Website

## Overview

The DSAC Website is a comprehensive platform designed to support a Data Structure and Algorithm Club with features for user authentication, discussion forums, resource sharing, event management, leaderboard tracking, and user profiles. This README provides detailed instructions for setup, deployment, and usage of all features.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Installation & Setup](#installation--setup)
5. [Running Locally](#running-locally)
6. [Deployment](#deployment)
7. [Admin Access](#admin-access)
8. [Database Management](#database-management)
9. [API Documentation](#api-documentation)
10. [Troubleshooting](#troubleshooting)
11. [Contributing Guidelines](#contributing-guidelines)
12. [Security Considerations](#security-considerations)

## Project Structure

The project follows a modern fullstack architecture:

```
/
├── client/                  # Frontend code
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   ├── pages/           # Page components
│   │   ├── App.tsx          # Main App component
│   │   └── main.tsx         # Entry point
├── server/                  # Backend code
│   ├── auth.ts              # Authentication logic
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API routes
│   ├── storage.ts           # Data storage interface
│   └── vite.ts              # Vite server setup
├── shared/                  # Shared code
│   └── schema.ts            # Database schema and types
└── package.json             # Project dependencies and scripts
```

## Features

### 1. Authentication System
- **User Registration**: New users can sign up with username, email, and password
- **Login/Logout**: Secure session management
- **Role-based Access**: Regular users and administrators
- **Protected Routes**: Certain routes only accessible to logged-in users

### 2. Discussion Forum
- **Topic Creation**: Users can create new discussion topics
- **Threading**: Support for threaded replies
- **Filtering**: Filter by experience level (beginner, intermediate, advanced)
- **Search**: Search across all forum content
- **Upvotes**: Mark helpful replies

### 3. Resources Section
- **Educational Content**: Curated resources on algorithms and data structures
- **External Links**: Links to relevant websites and videos
- **Categories**: Different types of resources (articles, videos, books)

### 4. Event Management
- **Upcoming Events**: Display and registration for future events
- **Event Details**: Time, location, capacity, and event type
- **Calendar View**: Visual representation of scheduled events
- **Past Events**: Archive of previous events with results

### 5. Leaderboard
- **Competitive Rankings**: Track performance in coding competitions
- **User Scores**: Display of top performers
- **Contest History**: Results from past competitions

### 6. User Profiles
- **Personal Information**: Customizable user profiles
- **Progress Tracking**: User's ranking and performance over time
- **Activity History**: Past forum posts and event participation

### 7. Admin Panel
- **Content Management**: Create, edit, and delete content
- **User Management**: Modify user roles and privileges
- **Event Creation**: Create and manage events
- **Leaderboard Management**: Update competition results

## Technology Stack

### Frontend
- **React**: UI library
- **TanStack Query**: Data fetching and state management
- **React Hook Form**: Form handling
- **Wouter**: Routing
- **Tailwind CSS**: Styling
- **Shadcn UI**: Component library

### Backend
- **Express**: Web server framework
- **Passport.js**: Authentication
- **Drizzle ORM**: Database ORM
- **Zod**: Schema validation

### Database
- **Memory Storage**: For development (default)
- **PostgreSQL**: For production deployment (optional)

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)
- Git

### Clone the Repository
```bash
git clone <repository-url>
cd dsac-website
```

### Install Dependencies
```bash
npm install
```

## Running Locally

### Development Mode
```bash
npm run dev
```
This will start both the backend and frontend servers. The application will be accessible at http://localhost:5000.

### Production Build
```bash
npm run build
npm start
```

## Deployment

### Option 1: Deploy to Replit
The project is configured to deploy on Replit:
1. Fork the project on Replit
2. Run the application using the "Run" button
3. For permanent deployment, click the "Deploy" button in the Replit interface

### Option 2: Deploy to Vercel/Netlify
1. Connect your GitHub repository to Vercel/Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add environment variables as needed

### Option 3: Traditional VPS Deployment
1. Set up a VPS with Node.js installed
2. Clone the repository
3. Install dependencies with `npm install`
4. Build the project with `npm run build`
5. Use PM2 or similar to keep the application running:
   ```bash
   npm install -g pm2
   pm2 start dist/index.js
   ```
6. Set up Nginx as a reverse proxy (recommended configuration below)

### Nginx Configuration (Example)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Setting Up a Custom Domain
1. Purchase a domain from a provider like Namecheap, GoDaddy, or Google Domains
2. Configure DNS settings to point to your server
3. Add SSL certificate using Let's Encrypt:
   ```bash
   certbot --nginx -d yourdomain.com
   ```

## Admin Access

### Accessing the Admin Panel
The admin panel is available at `/admin` route but is only accessible to users with the admin role.

### Default Admin Account
For first-time setup, a default admin account is created:
- Username: `admin`
- Password: `admin123`

**IMPORTANT**: Change this password immediately after first login.

### Granting Admin Privileges to Users
1. Log in with an admin account
2. Navigate to the Admin Panel > Users
3. Find the user and click "Edit"
4. Change their role to "admin"
5. Save changes

### Admin Features
As an admin, you can:
- Manage all content (create, edit, delete)
- Create and schedule events
- Update leaderboard entries
- Manage user accounts
- Access analytics (if enabled)

## Database Management

### Current Configuration
The application uses in-memory storage by default, which means data is not persisted between server restarts.

### Switching to PostgreSQL (Recommended for Production)
1. Install PostgreSQL if not already installed
2. Create a database for the application
3. Update the database connection information:
   - Edit `server/storage.ts` to use the DatabaseStorage implementation
   - Set environment variables for database connection:
     ```
     DATABASE_URL=postgresql://username:password@localhost:5432/database_name
     ```
4. Run database migrations:
   ```bash
   npm run db:push
   ```

### Database Backup and Restore
For PostgreSQL:
```bash
# Backup
pg_dump -U username database_name > backup.sql

# Restore
psql -U username database_name < backup.sql
```

## API Documentation

### Authentication Endpoints
- `POST /api/register` - Create a new user
- `POST /api/login` - Log in an existing user
- `POST /api/logout` - Log out the current user
- `GET /api/user` - Get the current user's information

### User Endpoints
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get specific user information
- `PATCH /api/users/:id` - Update user information (own account or admin only)

### Forum Endpoints
- `GET /api/forum` - Get all forum posts
- `GET /api/forum/:id` - Get a specific forum post with replies
- `POST /api/forum` - Create a new forum post
- `PATCH /api/forum/:id` - Update a forum post (owner or admin only)
- `DELETE /api/forum/:id` - Delete a forum post (owner or admin only)
- `GET /api/forum/replies` - Get all forum replies
- `POST /api/forum/:id/replies` - Add a reply to a forum post
- `PATCH /api/forum/replies/:id` - Update a reply (owner or admin only)
- `DELETE /api/forum/replies/:id` - Delete a reply (owner or admin only)
- `POST /api/forum/replies/:id/upvote` - Upvote a reply
- `POST /api/forum/:postId/best-answer/:replyId` - Mark a reply as the best answer

### Event Endpoints
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get a specific event
- `POST /api/events` - Create a new event (admin only)
- `PATCH /api/events/:id` - Update an event (admin only)
- `DELETE /api/events/:id` - Delete an event (admin only)
- `POST /api/events/:id/register` - Register for an event
- `DELETE /api/events/:id/register` - Cancel registration for an event

### Leaderboard Endpoints
- `GET /api/leaderboard` - Get the leaderboard data
- `POST /api/leaderboard/:userId` - Update leaderboard entry (admin only)

### Resource Endpoints
- `GET /api/resources` - Get all resources
- `GET /api/resources/:id` - Get a specific resource
- `POST /api/resources` - Create a new resource (admin only)
- `PATCH /api/resources/:id` - Update a resource (admin only)
- `DELETE /api/resources/:id` - Delete a resource (admin only)

## Troubleshooting

### Common Issues and Solutions

#### Application won't start
- Check Node.js version (should be v16+)
- Ensure all dependencies are installed
- Check for port conflicts (default is 5000)
- On Windows, try changing the server.listen configuration (see below)

#### Windows-specific issues
If you encounter `Error: listen ENOTSUP: operation not supported on socket 0.0.0.0:5000`, modify `server/index.ts`:
```typescript
// Change from:
server.listen({
  port,
  host: "0.0.0.0",
  reusePort: true,
}, () => {
  log(`serving on port ${port}`);
});

// To:
server.listen(port, () => {
  log(`serving on port ${port}`);
});
```

#### Database connection issues
- Verify database credentials
- Check that the database server is running
- Ensure database schema is properly set up

#### Authentication problems
- Clear browser cookies and try again
- Check if session store is properly configured
- Verify that the SESSION_SECRET environment variable is set

## Contributing Guidelines

### Setting Up for Development
1. Fork the repository
2. Clone your fork
3. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. Make your changes
5. Run tests (if available)
6. Commit with meaningful messages:
   ```bash
   git commit -m "Add: detailed description of your changes"
   ```
7. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
8. Create a pull request

### Code Style Guidelines
- Use TypeScript for all new code
- Follow ESLint configuration
- Document complex functions and components
- Use React hooks where appropriate
- Maintain proper typing throughout the codebase

## Security Considerations

### Best Practices (Already Implemented)
- Password hashing using scrypt
- CSRF protection via Express session configuration
- Content Security Policy headers
- Secure cookie settings for sessions
- Input validation using Zod schemas

### Additional Security Measures (Recommended)
1. **Environment Variables**: Store sensitive information in environment variables
2. **Rate Limiting**: Implement rate limiting for authentication endpoints
3. **HTTPS**: Always use HTTPS in production
4. **Regular Updates**: Keep dependencies updated for security patches
5. **Security Headers**: Add security headers using a package like Helmet.js
6. **Audit Logging**: Implement audit logging for sensitive operations

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Shadcn UI for the component library
- TanStack Query for data fetching
- Tailwind CSS for styling
- The Express.js team for the backend framework