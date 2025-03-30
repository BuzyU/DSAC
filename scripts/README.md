# DSAC Website Automation Scripts

This directory contains automation scripts for the Data Structure & Algorithm Club (DSAC) website. These scripts help automate common tasks like database management, monitoring, and setup.

## Available Scripts

### Setup and Installation

- **`setup-project.js`**: Complete project setup automation
  ```bash
  # Basic setup
  node scripts/setup-project.js
  
  # Setup with sample data
  node scripts/setup-project.js --seed
  
  # Reset database and setup (WARNING: Destroys all data)
  node scripts/setup-project.js --reset
  ```

- **`setup-db.js`**: Database initialization
  ```bash
  node scripts/setup-db.js
  ```

### Database Management

- **`backup-db.js`**: Backup the PostgreSQL database
  ```bash
  node scripts/backup-db.js
  ```

- **`restore-db.js`**: Restore from a backup
  ```bash
  # Restore from a specific backup file
  node scripts/restore-db.js backups/dsac_backup_2023-04-01.sql
  
  # Restore the latest backup
  node scripts/restore-db.js latest
  ```

- **`seed-db.js`**: Populate the database with sample data
  ```bash
  node scripts/seed-db.js
  ```

### Monitoring and Health Checks

- **`monitor.js`**: Application health monitoring
  ```bash
  # Run a one-time health check
  node scripts/monitor.js
  
  # Run continuous monitoring with 60-second intervals
  node scripts/monitor.js --interval=60
  ```

## Common Usage Scenarios

### First-time Setup

For a fresh installation with sample data:

```bash
# 1. Setup the project with seed data
node scripts/setup-project.js --seed

# 2. Start the application
npm run dev
```

### Regular Backups

To set up regular backups using cron:

```bash
# Example cron job for daily backups at 2 AM
0 2 * * * cd /path/to/project && node scripts/backup-db.js

# To restore in case of data loss
node scripts/restore-db.js latest
```

### Production Deployment

For deploying to production:

```bash
# 1. Setup the project (without sample data)
node scripts/setup-project.js

# 2. Build the application
npm run build

# 3. Start in production mode
npm start
```

### Monitoring in Production

For continuous monitoring in production:

```bash
# Run in background with nohup
nohup node scripts/monitor.js --interval=300 > monitoring.log 2>&1 &
```

## Notes

- All scripts require environment variables to be properly set (DATABASE_URL, etc.)
- For security reasons, change the default admin password after first login
- Backup files are stored in the `backups` directory
- The monitoring script requires the application to be running