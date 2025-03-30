#!/usr/bin/env node

/**
 * Database Restore Script
 * 
 * This script restores a PostgreSQL database backup.
 * Usage: node restore-db.js <backup-file-path>
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const readline = require('readline');
const { exit } = require('process');

// PostgreSQL connection info
const dbConfig = {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD
};

// Helper function to ask questions
function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function restoreDatabase() {
  console.log('🔄 Database Restore Tool');
  
  try {
    // Get backup file path from command line arguments
    let backupFilePath = process.argv[2];
    
    if (!backupFilePath) {
      console.error('❌ Error: Backup file path is required');
      console.log('Usage: node restore-db.js <backup-file-path>');
      console.log('   or: node restore-db.js latest  (to use the latest backup)');
      exit(1);
    }
    
    // Handle 'latest' keyword
    if (backupFilePath === 'latest') {
      const backupsDir = path.join(__dirname, '..', 'backups');
      const latestSymlinkPath = path.join(backupsDir, 'latest.sql');
      
      if (!fs.existsSync(latestSymlinkPath)) {
        console.error('❌ Error: No "latest" backup file found');
        exit(1);
      }
      
      backupFilePath = fs.readlinkSync(latestSymlinkPath);
      console.log(`Using latest backup: ${path.basename(backupFilePath)}`);
    }
    
    // Check if backup file exists
    if (!fs.existsSync(backupFilePath)) {
      console.error(`❌ Error: Backup file not found: ${backupFilePath}`);
      exit(1);
    }
    
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
    
    // Warn user about data loss
    console.log('\n⚠️  WARNING: This will REPLACE ALL DATA in the database!');
    console.log('⚠️  Make sure you have a backup of your current data if needed.');
    console.log(`⚠️  Database: ${dbConfig.database}`);
    console.log(`⚠️  Backup file: ${backupFilePath}`);
    console.log('');
    
    const confirm = await askQuestion('Are you sure you want to proceed? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Database restore aborted');
      exit(0);
    }
    
    // Start restoration process
    console.log('\n🔄 Starting database restoration...');
    
    // Drop all tables first for a clean restore
    console.log('Dropping existing tables...');
    
    const dropCommand = `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`;
    const env = { ...process.env, PGPASSWORD: dbConfig.password };
    
    execSync(dropCommand, { env });
    
    // Restore from backup
    console.log(`Restoring from backup: ${path.basename(backupFilePath)}`);
    
    const restoreCommand = `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -f "${backupFilePath}"`;
    
    execSync(restoreCommand, { env, stdio: 'inherit' });
    
    console.log('\n✅ Database restore completed successfully!');
    
  } catch (error) {
    console.error(`\n❌ Restore failed: ${error.message}`);
    exit(1);
  }
}

// Run the function
restoreDatabase();