#!/usr/bin/env node

/**
 * Database Setup Automation Script
 * 
 * This script handles:
 * 1. Database initialization and schema setup
 * 2. Creation of admin user if it doesn't exist
 * 3. Verification of database connection
 */

const { Pool } = require('pg');
const { execSync } = require('child_process');
const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');
const { exit } = require('process');

// Utility function to hash passwords
const scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function setupDatabase() {
  console.log(`
╔════════════════════════════════════╗
║       Database Setup Script        ║
╚════════════════════════════════════╝
  `);
  
  // Step 1: Check database connection
  console.log('🔄 Checking database connection...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database');
    
    // Get database version
    const versionResult = await client.query('SELECT version()');
    console.log(`Database version: ${versionResult.rows[0].version.split(',')[0]}`);
    
    client.release();
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error.message);
    console.log('Please check your database credentials and try again.');
    exit(1);
  }
  
  // Step 2: Apply database schema
  console.log('\n🔄 Applying database schema...');
  
  try {
    console.log('Running drizzle-kit schema push...');
    execSync('npm run db:push', { stdio: 'inherit' });
    console.log('✅ Database schema applied successfully');
  } catch (error) {
    console.error('❌ Failed to apply database schema:', error.message);
    exit(1);
  }
  
  // Step 3: Check and create admin user if needed
  console.log('\n🔄 Checking for admin user...');
  
  try {
    // Check if users table exists
    const tablesResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tablesResult.rows[0].exists) {
      console.error('❌ Users table does not exist. Schema migration may have failed.');
      exit(1);
    }
    
    // Check if admin user exists
    const adminResult = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
    
    if (adminResult.rows.length === 0) {
      console.log('Creating admin user...');
      
      const hashedPassword = await hashPassword('admin123');
      
      await pool.query(`
        INSERT INTO users (username, password, email, display_name, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      `, ['admin', hashedPassword, 'admin@dsac.example', 'Administrator', 'admin']);
      
      console.log('✅ Admin user created successfully');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   ⚠️  IMPORTANT: Change this password after first login!');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error checking/creating admin user:', error.message);
    exit(1);
  }
  
  // Step 4: Verify database tables
  console.log('\n🔄 Verifying database tables...');
  
  try {
    const expectedTables = [
      'users',
      'events',
      'event_registrations',
      'contest_results',
      'forum_posts',
      'forum_replies',
      'resources'
    ];
    
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    
    console.log('Detected tables:');
    existingTables.forEach(table => {
      const exists = expectedTables.includes(table);
      console.log(`  ${exists ? '✅' : '❓'} ${table}`);
    });
    
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('\n⚠️  Warning: Some expected tables are missing:');
      missingTables.forEach(table => console.log(`  ❌ ${table}`));
      console.log('This might indicate issues with the schema migration.');
    } else {
      console.log('\n✅ All expected tables exist');
    }
  } catch (error) {
    console.error('❌ Error verifying database tables:', error.message);
    // Continue execution, this is just a verification step
  }
  
  // All done!
  console.log(`
╔════════════════════════════════════╗
║    Database Setup Complete! 🎉    ║
╚════════════════════════════════════╝
  `);
  
  await pool.end();
}

setupDatabase().catch(error => {
  console.error('Unhandled error:', error);
  exit(1);
});