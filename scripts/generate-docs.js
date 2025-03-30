#!/usr/bin/env node

/**
 * Documentation Generator Script
 * 
 * This script generates comprehensive documentation for the DSAC website:
 * 1. API documentation 
 * 2. Database schema
 * 3. Component documentation
 * 4. Setup instructions
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { exit } = require('process');

// Connect to database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Output directory for documentation
const docsDir = path.join(__dirname, '..', 'docs');

async function generateDocs() {
  console.log('🔄 Generating project documentation...');
  
  try {
    // Create docs directory if it doesn't exist
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    // Generate API documentation
    await generateApiDocs();
    
    // Generate database schema documentation
    await generateDbSchemaDocs();
    
    // Generate setup guide
    await generateSetupGuide();
    
    // Generate API testing guide
    await generateApiTestingGuide();
    
    // Generate index file
    await generateIndexFile();
    
    console.log('\n✅ Documentation generated successfully!');
    console.log(`Documentation is available in the '${docsDir}' directory.`);
    
  } catch (error) {
    console.error('❌ Documentation generation failed:', error.message);
    exit(1);
  } finally {
    await pool.end();
  }
}

async function generateApiDocs() {
  console.log('📝 Generating API documentation...');
  
  const apiDocsPath = path.join(docsDir, 'api-documentation.md');
  
  let content = `# DSAC Website API Documentation

This document provides details on all available API endpoints for the Data Structure & Algorithm Club website.

## Table of Contents

- [Authentication API](#authentication-api)
- [User API](#user-api)
- [Events API](#events-api)
- [Forum API](#forum-api)
- [Resources API](#resources-api)
- [Leaderboard API](#leaderboard-api)

## Authentication API

### POST /api/register

Register a new user account.

**Request Body:**
\`\`\`json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "displayName": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "displayName": "string",
  "role": "string"
}
\`\`\`

### POST /api/login

Log in with an existing account.

**Request Body:**
\`\`\`json
{
  "username": "string",
  "password": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "displayName": "string",
  "role": "string"
}
\`\`\`

### POST /api/logout

Log out the current user.

**Response:** Status 200 on success

### GET /api/user

Get the current user's information.

**Response:**
\`\`\`json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "displayName": "string",
  "role": "string",
  "avatar": "string | null",
  "bio": "string | null",
  "level": "string | null"
}
\`\`\`

## User API

### GET /api/users

Get all users (admin only).

**Response:**
\`\`\`json
[
  {
    "id": "number",
    "username": "string",
    "email": "string",
    "displayName": "string",
    "role": "string",
    "avatar": "string | null",
    "bio": "string | null",
    "level": "string | null",
    "createdAt": "string"
  }
]
\`\`\`

### GET /api/users/:id

Get a specific user's information.

**Response:**
\`\`\`json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "displayName": "string",
  "role": "string",
  "avatar": "string | null",
  "bio": "string | null",
  "level": "string | null",
  "createdAt": "string"
}
\`\`\`

### PATCH /api/users/:id

Update a user's information (own account or admin only).

**Request Body:**
\`\`\`json
{
  "displayName": "string",
  "email": "string",
  "avatar": "string",
  "bio": "string",
  "level": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "displayName": "string",
  "role": "string",
  "avatar": "string | null",
  "bio": "string | null",
  "level": "string | null"
}
\`\`\`

## Events API

### GET /api/events

Get all events.

**Response:**
\`\`\`json
[
  {
    "id": "number",
    "title": "string",
    "description": "string",
    "location": "string",
    "eventType": "string",
    "capacity": "number",
    "startDate": "string",
    "endDate": "string",
    "createdAt": "string",
    "userId": "number"
  }
]
\`\`\`

### GET /api/events/:id

Get a specific event.

**Response:**
\`\`\`json
{
  "id": "number",
  "title": "string",
  "description": "string",
  "location": "string",
  "eventType": "string",
  "capacity": "number",
  "startDate": "string",
  "endDate": "string",
  "createdAt": "string",
  "userId": "number",
  "registrations": [
    {
      "id": "number",
      "userId": "number",
      "username": "string",
      "createdAt": "string"
    }
  ]
}
\`\`\`

### POST /api/events

Create a new event (admin only).

**Request Body:**
\`\`\`json
{
  "title": "string",
  "description": "string",
  "location": "string",
  "eventType": "string",
  "capacity": "number",
  "startDate": "string",
  "endDate": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "number",
  "title": "string",
  "description": "string",
  "location": "string",
  "eventType": "string",
  "capacity": "number",
  "startDate": "string",
  "endDate": "string",
  "createdAt": "string",
  "userId": "number"
}
\`\`\`

### PATCH /api/events/:id

Update an event (admin only).

**Request Body:**
\`\`\`json
{
  "title": "string",
  "description": "string",
  "location": "string",
  "eventType": "string",
  "capacity": "number",
  "startDate": "string",
  "endDate": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "number",
  "title": "string",
  "description": "string",
  "location": "string",
  "eventType": "string",
  "capacity": "number",
  "startDate": "string",
  "endDate": "string",
  "createdAt": "string",
  "userId": "number"
}
\`\`\`

### DELETE /api/events/:id

Delete an event (admin only).

**Response:** Status 200 on success

### POST /api/events/:id/register

Register for an event.

**Response:**
\`\`\`json
{
  "id": "number",
  "eventId": "number",
  "userId": "number",
  "createdAt": "string"
}
\`\`\`

### DELETE /api/events/:id/register

Cancel registration for an event.

**Response:** Status 200 on success

## Forum API

### GET /api/forum

Get all forum posts.

**Query Parameters:**
- category (optional): Filter by post category
- difficulty (optional): Filter by difficulty level

**Response:**
\`\`\`json
[
  {
    "id": "number",
    "title": "string",
    "content": "string",
    "category": "string",
    "difficulty": "string",
    "views": "number",
    "createdAt": "string",
    "updatedAt": "string",
    "userId": "number",
    "username": "string",
    "replyCount": "number"
  }
]
\`\`\`

### GET /api/forum/:id

Get a specific forum post with replies.

**Response:**
\`\`\`json
{
  "id": "number",
  "title": "string",
  "content": "string",
  "category": "string",
  "difficulty": "string",
  "views": "number",
  "createdAt": "string",
  "updatedAt": "string",
  "userId": "number",
  "username": "string",
  "replies": [
    {
      "id": "number",
      "content": "string",
      "upvotes": "number",
      "isBestAnswer": "boolean",
      "createdAt": "string",
      "updatedAt": "string",
      "userId": "number",
      "username": "string"
    }
  ]
}
\`\`\`

### POST /api/forum

Create a new forum post.

**Request Body:**
\`\`\`json
{
  "title": "string",
  "content": "string",
  "category": "string",
  "difficulty": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "number",
  "title": "string",
  "content": "string",
  "category": "string",
  "difficulty": "string",
  "views": 0,
  "createdAt": "string",
  "updatedAt": "string",
  "userId": "number"
}
\`\`\`

### PATCH /api/forum/:id

Update a forum post (owner or admin only).

**Request Body:**
\`\`\`json
{
  "title": "string",
  "content": "string",
  "category": "string",
  "difficulty": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "number",
  "title": "string",
  "content": "string",
  "category": "string",
  "difficulty": "string",
  "views": "number",
  "createdAt": "string",
  "updatedAt": "string",
  "userId": "number"
}
\`\`\`

### DELETE /api/forum/:id

Delete a forum post (owner or admin only).

**Response:** Status 200 on success

### POST /api/forum/:id/replies

Add a reply to a forum post.

**Request Body:**
\`\`\`json
{
  "content": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "number",
  "content": "string",
  "upvotes": 0,
  "isBestAnswer": false,
  "createdAt": "string",
  "updatedAt": "string",
  "userId": "number",
  "postId": "number"
}
\`\`\`

### PATCH /api/forum/replies/:id

Update a reply (owner or admin only).

**Request Body:**
\`\`\`json
{
  "content": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "number",
  "content": "string",
  "upvotes": "number",
  "isBestAnswer": "boolean",
  "createdAt": "string",
  "updatedAt": "string",
  "userId": "number",
  "postId": "number"
}
\`\`\`

### DELETE /api/forum/replies/:id

Delete a reply (owner or admin only).

**Response:** Status 200 on success

### POST /api/forum/replies/:id/upvote

Upvote a reply.

**Response:**
\`\`\`json
{
  "id": "number",
  "upvotes": "number"
}
\`\`\`

### POST /api/forum/:postId/best-answer/:replyId

Mark a reply as the best answer (post owner or admin only).

**Response:**
\`\`\`json
{
  "id": "number",
  "isBestAnswer": true
}
\`\`\`

## Resources API

### GET /api/resources

Get all resources.

**Query Parameters:**
- type (optional): Filter by resource type

**Response:**
\`\`\`json
[
  {
    "id": "number",
    "title": "string",
    "description": "string",
    "link": "string",
    "resourceType": "string",
    "content": "string",
    "createdAt": "string",
    "updatedAt": "string",
    "userId": "number"
  }
]
\`\`\`

### GET /api/resources/:id

Get a specific resource.

**Response:**
\`\`\`json
{
  "id": "number",
  "title": "string",
  "description": "string",
  "link": "string",
  "resourceType": "string",
  "content": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "userId": "number",
  "username": "string"
}
\`\`\`

### POST /api/resources

Create a new resource (admin only).

**Request Body:**
\`\`\`json
{
  "title": "string",
  "description": "string",
  "link": "string",
  "resourceType": "string",
  "content": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "number",
  "title": "string",
  "description": "string",
  "link": "string",
  "resourceType": "string",
  "content": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "userId": "number"
}
\`\`\`

### PATCH /api/resources/:id

Update a resource (admin only).

**Request Body:**
\`\`\`json
{
  "title": "string",
  "description": "string",
  "link": "string",
  "resourceType": "string",
  "content": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "number",
  "title": "string",
  "description": "string",
  "link": "string",
  "resourceType": "string",
  "content": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "userId": "number"
}
\`\`\`

### DELETE /api/resources/:id

Delete a resource (admin only).

**Response:** Status 200 on success

## Leaderboard API

### GET /api/leaderboard

Get the leaderboard data.

**Response:**
\`\`\`json
[
  {
    "userId": "number",
    "username": "string",
    "displayName": "string",
    "score": "number",
    "contestCount": "number",
    "topProblem": "string"
  }
]
\`\`\`

### POST /api/leaderboard/:userId

Update leaderboard entry (admin only).

**Request Body:**
\`\`\`json
{
  "score": "number",
  "contestCount": "number",
  "topProblem": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "userId": "number",
  "username": "string",
  "displayName": "string",
  "score": "number",
  "contestCount": "number",
  "topProblem": "string"
}
\`\`\`
`;
  
  fs.writeFileSync(apiDocsPath, content);
  console.log(`✅ API documentation generated: ${apiDocsPath}`);
}

async function generateDbSchemaDocs() {
  console.log('📝 Generating database schema documentation...');
  
  const dbSchemaPath = path.join(docsDir, 'database-schema.md');
  
  let content = `# DSAC Website Database Schema

This document provides details on the database schema for the Data Structure & Algorithm Club website.

## Database Tables

`;

  try {
    // Get list of tables
    const tableResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    // For each table, get its columns
    for (const tableRow of tableResult.rows) {
      const tableName = tableRow.table_name;
      
      content += `### ${tableName}\n\n`;
      
      // Get columns for this table
      const columnResult = await pool.query(`
        SELECT 
          column_name, 
          data_type, 
          character_maximum_length, 
          column_default, 
          is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      
      content += `| Column Name | Data Type | Length | Default | Nullable |\n`;
      content += `|-------------|-----------|--------|---------|----------|\n`;
      
      for (const column of columnResult.rows) {
        const length = column.character_maximum_length ? column.character_maximum_length : '';
        const defaultVal = column.column_default ? column.column_default : '';
        const nullable = column.is_nullable === 'YES' ? 'Yes' : 'No';
        
        content += `| ${column.column_name} | ${column.data_type} | ${length} | ${defaultVal} | ${nullable} |\n`;
      }
      
      // Get primary keys
      const pkResult = await pool.query(`
        SELECT kc.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kc
          ON kc.constraint_name = tc.constraint_name
          AND kc.table_schema = tc.table_schema
          AND kc.table_name = tc.table_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = $1
      `, [tableName]);
      
      if (pkResult.rows.length > 0) {
        const pkColumns = pkResult.rows.map(row => row.column_name).join(', ');
        content += `\n**Primary Key:** ${pkColumns}\n`;
      }
      
      // Get foreign keys
      const fkResult = await pool.query(`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = $1
      `, [tableName]);
      
      if (fkResult.rows.length > 0) {
        content += `\n**Foreign Keys:**\n`;
        
        for (const fk of fkResult.rows) {
          content += `- ${fk.column_name} -> ${fk.foreign_table_name}(${fk.foreign_column_name})\n`;
        }
      }
      
      content += `\n`;
    }
    
    // Add ER diagram reference (placeholder)
    content += `## Entity Relationship Diagram

For a visual representation of the database schema and relationships, see the ER diagram in the project repository.

## Database Relationships

- Users have many Events (created by them)
- Users have many EventRegistrations (events they registered for)
- Users have many ForumPosts (posts they created)
- Users have many ForumReplies (replies they made)
- Users have many ContestResults (results from contests they participated in)
- Users have many Resources (resources they created)
- Events have many EventRegistrations (users registered for the event)
- Events have many ContestResults (if the event is a contest)
- ForumPosts have many ForumReplies (replies to the post)
`;
    
    fs.writeFileSync(dbSchemaPath, content);
    console.log(`✅ Database schema documentation generated: ${dbSchemaPath}`);
    
  } catch (error) {
    console.error('❌ Error generating database schema documentation:', error.message);
    throw error;
  }
}

async function generateSetupGuide() {
  console.log('📝 Generating setup guide...');
  
  const setupGuidePath = path.join(docsDir, 'setup-guide.md');
  
  let content = `# DSAC Website Setup Guide

This guide provides step-by-step instructions to set up the Data Structure & Algorithm Club website project.

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- PostgreSQL (v13 or higher)

## Installation Steps

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd dsac-website
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set Up Environment Variables

Create a \`.env\` file in the project root with the following variables:

\`\`\`
DATABASE_URL=postgresql://username:password@hostname:port/database
PGUSER=username
PGHOST=hostname
PGPASSWORD=password
PGDATABASE=database
PGPORT=port
SESSION_SECRET=your_session_secret_here
\`\`\`

Note: Replace the values with your actual PostgreSQL database credentials.

### 4. Set Up the Database

You can use our automated setup script:

\`\`\`bash
node scripts/setup-project.js
\`\`\`

This will:
- Verify your database connection
- Create necessary tables
- Create a default admin user

To include sample data, use:

\`\`\`bash
node scripts/setup-project.js --seed
\`\`\`

### 5. Start the Development Server

\`\`\`bash
npm run dev
\`\`\`

The application will be available at http://localhost:5000.

## Default Admin Account

After setup, a default admin account is created:

- Username: \`admin\`
- Password: \`admin123\`

**IMPORTANT:** Change this password immediately after the first login!

## Project Structure

\`\`\`
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
├── scripts/                 # Automation scripts
│   ├── backup-db.js         # Database backup script
│   ├── restore-db.js        # Database restore script
│   ├── seed-db.js           # Sample data generator
│   ├── setup-db.js          # Database setup script
│   ├── setup-project.js     # Project setup script
│   └── monitor.js           # Application monitoring
└── package.json             # Project dependencies and scripts
\`\`\`

## Automation Scripts

The project includes several automation scripts to make development and maintenance easier:

- **setup-project.js**: Complete project setup
- **backup-db.js**: Create database backups
- **restore-db.js**: Restore from backups
- **seed-db.js**: Populate with sample data
- **monitor.js**: Application health monitoring

See the \`scripts/README.md\` file for detailed information on these scripts.

## Troubleshooting

### Database Connection Issues

- Verify your database credentials in the \`.env\` file
- Ensure PostgreSQL is running
- Check if the database exists

### Server Won't Start

- Check if port 5000 is already in use
- Verify that all dependencies are installed
- Check for errors in the console output

## Next Steps

After setup, you should:

1. Change the default admin password
2. Explore the admin panel at /admin
3. Customize the content for your specific needs
`;
  
  fs.writeFileSync(setupGuidePath, content);
  console.log(`✅ Setup guide generated: ${setupGuidePath}`);
}

async function generateApiTestingGuide() {
  console.log('📝 Generating API testing guide...');
  
  const apiTestingPath = path.join(docsDir, 'api-testing-guide.md');
  
  let content = `# DSAC Website API Testing Guide

This guide provides instructions on how to test the API endpoints for the Data Structure & Algorithm Club website.

## Setup for API Testing

You can test the API using tools like:

- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [cURL](https://curl.se/)
- [HTTPie](https://httpie.io/)

## Authentication

Most endpoints require authentication. Follow these steps:

1. Log in using \`POST /api/login\` to get a session cookie
2. Include the session cookie in subsequent requests
3. For admin-only endpoints, make sure to log in with an admin account

## Example API Tests

### Authentication Flow

#### 1. Register a new user

\`\`\`bash
curl -X POST http://localhost:5000/api/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com",
    "displayName": "Test User"
  }'
\`\`\`

#### 2. Log in

\`\`\`bash
curl -X POST http://localhost:5000/api/login \\
  -H "Content-Type: application/json" \\
  -c cookies.txt \\
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
\`\`\`

#### 3. Get current user info

\`\`\`bash
curl -X GET http://localhost:5000/api/user \\
  -b cookies.txt
\`\`\`

#### 4. Log out

\`\`\`bash
curl -X POST http://localhost:5000/api/logout \\
  -b cookies.txt
\`\`\`

### Events API

#### Get all events

\`\`\`bash
curl -X GET http://localhost:5000/api/events
\`\`\`

#### Create a new event (admin only)

\`\`\`bash
# First, log in as admin
curl -X POST http://localhost:5000/api/login \\
  -H "Content-Type: application/json" \\
  -c cookies.txt \\
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Then create an event
curl -X POST http://localhost:5000/api/events \\
  -H "Content-Type: application/json" \\
  -b cookies.txt \\
  -d '{
    "title": "Coding Workshop",
    "description": "Learn about algorithms and data structures",
    "location": "Online",
    "eventType": "workshop",
    "capacity": 50,
    "startDate": "2023-04-15T14:00:00.000Z",
    "endDate": "2023-04-15T16:00:00.000Z"
  }'
\`\`\`

### Forum API

#### Get all forum posts

\`\`\`bash
curl -X GET http://localhost:5000/api/forum
\`\`\`

#### Create a new forum post

\`\`\`bash
# Log in first
curl -X POST http://localhost:5000/api/login \\
  -H "Content-Type: application/json" \\
  -c cookies.txt \\
  -d '{
    "username": "testuser",
    "password": "password123"
  }'

# Then create a post
curl -X POST http://localhost:5000/api/forum \\
  -H "Content-Type: application/json" \\
  -b cookies.txt \\
  -d '{
    "title": "Question about binary trees",
    "content": "How do you balance a binary search tree?",
    "category": "question",
    "difficulty": "intermediate"
  }'
\`\`\`

## Automated Testing Script

You can use this simple bash script to test common API endpoints:

\`\`\`bash
#!/bin/bash

BASE_URL="http://localhost:5000"
COOKIE_FILE="cookies.txt"

# Reset cookie file
> $COOKIE_FILE

echo "🔶 Testing API endpoints..."

# Test 1: Register user
echo "🔷 Test 1: Register user"
curl -s -X POST "$BASE_URL/api/register" \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "apitester",
    "password": "test123",
    "email": "api@test.com",
    "displayName": "API Tester"
  }'
echo -e "\\n"

# Test 2: Login
echo "🔷 Test 2: Login"
curl -s -X POST "$BASE_URL/api/login" \\
  -c $COOKIE_FILE \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "apitester",
    "password": "test123"
  }'
echo -e "\\n"

# Test 3: Get current user
echo "🔷 Test 3: Get current user"
curl -s -X GET "$BASE_URL/api/user" \\
  -b $COOKIE_FILE
echo -e "\\n"

# Test 4: Get events
echo "🔷 Test 4: Get events"
curl -s -X GET "$BASE_URL/api/events"
echo -e "\\n"

# Test 5: Create forum post
echo "🔷 Test 5: Create forum post"
curl -s -X POST "$BASE_URL/api/forum" \\
  -b $COOKIE_FILE \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "API Test Post",
    "content": "This is a test post from the API testing script",
    "category": "discussion",
    "difficulty": "beginner"
  }'
echo -e "\\n"

# Test 6: Get forum posts
echo "🔷 Test 6: Get forum posts"
curl -s -X GET "$BASE_URL/api/forum"
echo -e "\\n"

# Test 7: Logout
echo "🔷 Test 7: Logout"
curl -s -X POST "$BASE_URL/api/logout" \\
  -b $COOKIE_FILE
echo -e "\\n"

echo "✅ API testing complete"
\`\`\`

Save this as \`test-api.sh\` in your project root, make it executable with \`chmod +x test-api.sh\`, and run it with \`./test-api.sh\`.

## Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side error

## Testing Admin Features

To test admin features, log in with the admin account:

\`\`\`bash
curl -X POST http://localhost:5000/api/login \\
  -H "Content-Type: application/json" \\
  -c cookies.txt \\
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
\`\`\`

Then you can access admin-only endpoints such as:
- \`POST /api/events\` (Create event)
- \`PATCH /api/events/:id\` (Update event)
- \`DELETE /api/events/:id\` (Delete event)
- \`POST /api/resources\` (Create resource)
`;
  
  fs.writeFileSync(apiTestingPath, content);
  console.log(`✅ API testing guide generated: ${apiTestingPath}`);
}

async function generateIndexFile() {
  console.log('📝 Generating documentation index...');
  
  const indexPath = path.join(docsDir, 'index.md');
  
  let content = `# DSAC Website Documentation

Welcome to the Data Structure & Algorithm Club website documentation.

## Documentation Index

### Setup and Development
- [Setup Guide](setup-guide.md) - How to set up the project
- [API Testing Guide](api-testing-guide.md) - How to test the API endpoints

### Technical Documentation
- [API Documentation](api-documentation.md) - Detailed API reference
- [Database Schema](database-schema.md) - Database structure and relationships

### Additional Resources
- [scripts/README.md](../scripts/README.md) - Information about automation scripts

## Quick Start

1. Follow the [Setup Guide](setup-guide.md) to install and configure the project
2. Use the default admin account (username: \`admin\`, password: \`admin123\`) to access the admin panel
3. Change the default admin password after first login

## Getting Help

If you encounter any issues or have questions about this project:
1. Check the troubleshooting section in the [Setup Guide](setup-guide.md)
2. Review the documentation in this directory
3. Contact the project maintainers
`;
  
  fs.writeFileSync(indexPath, content);
  console.log(`✅ Documentation index generated: ${indexPath}`);
}

// Run the function
generateDocs();