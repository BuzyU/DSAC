# Data Structure & Algorithm Club (DSAC) Website

A comprehensive platform for Data Structure & Algorithm enthusiasts to track progress, participate in contests, share resources, and engage with the community.

## ✨ Features

- **User Authentication**: Secure login/register system with role-based access control
- **Leaderboard System**: Real-time ranking of members based on contest performance
- **Events Management**: Create, join, and track upcoming coding competitions & workshops
- **Discussion Forum**: Ask questions and share knowledge related to DS&A topics
- **Resource Sharing**: Curated collection of learning materials and practice problems
- **User Profiles**: Personalized profiles with progress tracking and achievements

## 🚀 Tech Stack

- **Frontend**: React, Tailwind CSS, Shadcn UI components
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **State Management**: React Query for server state

## 📋 Project Structure

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
├── scripts/                 # Automation scripts
└── docs/                    # Documentation
```

## 📊 Database Schema

The application uses a PostgreSQL database with the following main tables:

- **users**: User accounts with authentication and profile information
- **events**: Upcoming/past competitions, workshops, and meetups
- **event_registrations**: Tracks user registrations for events
- **contest_results**: Stores performance metrics from coding contests
- **forum_posts**: Discussion topics and questions
- **forum_replies**: Responses to forum posts
- **resources**: Learning materials and practice problems

## 🔒 Authentication & Authorization

The system implements a secure authentication flow using:
- Session-based authentication with encrypted cookies
- Password hashing with scrypt and salting
- Role-based access control (user/admin permissions)

## 🛠️ Setup and Installation

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database

### Installation Steps

1. Clone the repository
   ```
   git clone <repository-url>
   cd dsac-website
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file with the following:
   ```
   DATABASE_URL=postgresql://username:password@hostname:port/database
   PGUSER=username
   PGHOST=hostname
   PGPASSWORD=password
   PGDATABASE=database
   PGPORT=port
   SESSION_SECRET=your_secret_key
   ```

4. Run the setup script
   ```bash
   # Basic setup
   node scripts/setup-project.js
   
   # Setup with sample data
   node scripts/setup-project.js --seed
   ```

5. Start the development server
   ```
   npm run dev
   ```

6. Access the website at `http://localhost:5000`

### Automated Scripts

The project includes several automation scripts to assist with development, maintenance, and monitoring:

- **Database Management**
  ```bash
  # Backup database
  node scripts/backup-db.js
  
  # Restore database
  node scripts/restore-db.js latest
  
  # Seed database with sample data
  node scripts/seed-db.js
  ```

- **Application Monitoring**
  ```bash
  # One-time health check
  node scripts/monitor.js
  
  # Continuous monitoring (every 60 seconds)
  node scripts/monitor.js --interval=60
  ```

- **Documentation Generation**
  ```bash
  # Generate comprehensive documentation
  node scripts/generate-docs.js
  ```

- **Scheduled Tasks**
  ```bash
  # Run specific maintenance tasks
  node scripts/tasks.js backup
  node scripts/tasks.js cleanup
  node scripts/tasks.js report
  ```

See [scripts/README.md](scripts/README.md) for detailed information on all automation scripts.

## 🧪 Testing

The project includes comprehensive testing:

- API testing using the provided test scripts in `scripts/`
- End-to-end testing documentation available in `docs/`

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:

- [Setup Guide](docs/setup-guide.md)
- [API Documentation](docs/api-documentation.md)
- [Database Schema](docs/database-schema.md)
- [API Testing Guide](docs/api-testing-guide.md)

## 🤝 Contributing

We welcome contributions to the DSAC Website project! Please feel free to submit issues and pull requests.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.