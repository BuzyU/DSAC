#!/usr/bin/env node

/**
 * Database Backup Script
 * 
 * This script creates a backup of the PostgreSQL database
 * and saves it to the backups directory.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { exit } = require('process');

// Create backups directory if it doesn't exist
const backupsDir = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

// Generate backup filename with timestamp
const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-');
const backupFileName = `dsac_backup_${timestamp}.sql`;
const backupFilePath = path.join(backupsDir, backupFileName);

// PostgreSQL connection info
const dbConfig = {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD
};

async function backupDatabase() {
  console.log('🔄 Starting database backup...');
  
  try {
    // First, check database connection
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    try {
      const client = await pool.connect();
      console.log('✅ Database connection successful');
      client.release();
    } catch (error) {
      console.error('❌ Failed to connect to the database:', error.message);
      exit(1);
    } finally {
      await pool.end();
    }
    
    // Create backup command
    const pgDumpCommand = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -F p > "${backupFilePath}"`;
    
    // Set password environment variable for pg_dump
    const env = { ...process.env, PGPASSWORD: dbConfig.password };
    
    // Execute the backup command
    console.log(`Creating backup: ${backupFileName}`);
    execSync(pgDumpCommand, { env });
    
    const stats = fs.statSync(backupFilePath);
    const fileSizeInBytes = stats.size;
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
    
    // Update symlink to latest backup
    const latestSymlinkPath = path.join(backupsDir, 'latest.sql');
    if (fs.existsSync(latestSymlinkPath)) {
      fs.unlinkSync(latestSymlinkPath);
    }
    fs.symlinkSync(backupFilePath, latestSymlinkPath);
    
    // List all backups and maintain only the last 5
    const allBackups = fs.readdirSync(backupsDir)
      .filter(file => file.startsWith('dsac_backup_') && file.endsWith('.sql'))
      .map(file => path.join(backupsDir, file))
      .sort((a, b) => fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime());
    
    // Delete older backups (keep latest 5)
    if (allBackups.length > 5) {
      console.log('Removing older backups (keeping latest 5)...');
      for (let i = 5; i < allBackups.length; i++) {
        fs.unlinkSync(allBackups[i]);
        console.log(`Deleted old backup: ${path.basename(allBackups[i])}`);
      }
    }
    
    console.log(`\n✅ Database backup completed successfully!`);
    console.log(`Backup file: ${backupFilePath}`);
    console.log(`File size: ${fileSizeInMB} MB`);
    console.log(`Total backups available: ${Math.min(allBackups.length, 5)}`);
    
  } catch (error) {
    console.error(`❌ Backup failed: ${error.message}`);
    exit(1);
  }
}

backupDatabase();