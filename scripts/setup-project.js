#!/usr/bin/env node

/**
 * Project Setup Automation Script
 * 
 * This script automates the entire setup process for the DSAC website:
 * 1. Verifies environment variables
 * 2. Checks database connection
 * 3. Sets up database schema
 * 4. Creates admin user if needed
 * 5. Optionally seeds the database with sample data
 * 6. Starts the application
 * 
 * Usage: node setup-project.js [--seed] [--reset]
 * Options:
 *   --seed  : Seeds the database with sample data
 *   --reset : Resets the database before setup (WARNING: DESTROYS ALL DATA)
 */

const readline = require('readline');
const { execSync } = require('child_process');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');
const { exit } = require('process');

// Parse command line arguments
const args = process.argv.slice(2);
const shouldSeed = args.includes('--seed');
const shouldReset = args.includes('--reset');

// Banner
console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║      DSAC Website Setup Automation Script          ║
║                                                    ║
╚════════════════════════════════════════════════════╝
`);

// Confirmation for dangerous operations
if (shouldReset) {
  console.log('⚠️  WARNING: The --reset flag will DELETE ALL DATA in the database!');
  console.log('⚠️  This action cannot be undone.');
  console.log('');
}

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

// Utility function to hash passwords
const scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

// Main setup function
async function setupProject() {
  try {
    console.log('🔄 Starting setup process...');
    
    // Step 1: Check environment variables
    console.log('\n📋 Step 1: Checking environment variables');
    
    const requiredEnvVars = ['DATABASE_URL', 'PGUSER', 'PGHOST', 'PGPASSWORD', 'PGDATABASE', 'PGPORT'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
      console.log('Please set these environment variables and try again.');
      exit(1);
    }
    
    console.log('✅ All required environment variables are set');
    
    // Step 2: Test database connection
    console.log('\n📋 Step 2: Testing database connection');
    
    let pool;
    try {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL
      });
      
      const client = await pool.connect();
      console.log('✅ Successfully connected to the database');
      client.release();
      
    } catch (error) {
      console.error('❌ Failed to connect to the database:', error.message);
      exit(1);
    }
    
    // Step 3: Reset database if requested
    if (shouldReset) {
      console.log('\n📋 Step 3: Resetting database');
      
      const confirm = await askQuestion('Are you sure you want to reset the database? (yes/no): ');
      
      if (confirm.toLowerCase() !== 'yes') {
        console.log('❌ Database reset aborted');
        exit(0);
      }
      
      try {
        // Drop all tables
        const tables = await pool.query(`
          SELECT tablename FROM pg_tables
          WHERE schemaname = 'public'
        `);
        
        console.log(`Found ${tables.rows.length} tables to drop`);
        
        for (const table of tables.rows) {
          const tableName = table.tablename;
          console.log(`Dropping table: ${tableName}`);
          await pool.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
        }
        
        console.log('✅ Database reset complete');
        
      } catch (error) {
        console.error('❌ Error resetting database:', error.message);
        exit(1);
      }
    }
    
    // Step 4: Apply database schema
    console.log('\n📋 Step 4: Setting up database schema');
    
    try {
      console.log('Running schema migration with drizzle-kit...');
      execSync('npm run db:push', { stdio: 'inherit' });
      console.log('✅ Database schema setup complete');
      
    } catch (error) {
      console.error('❌ Error setting up database schema:', error.message);
      exit(1);
    }
    
    // Step 5: Create admin user if it doesn't exist
    console.log('\n📋 Step 5: Checking for admin user');
    
    try {
      const adminUser = await pool.query(`
        SELECT * FROM users WHERE username = 'admin'
      `);
      
      if (adminUser.rows.length === 0) {
        console.log('Creating admin user...');
        
        const hashedPassword = await hashPassword('admin123');
        
        await pool.query(`
          INSERT INTO users (username, password, email, display_name, role, created_at, updated_at)
          VALUES ('admin', $1, 'admin@dsac.example', 'Administrator', 'admin', NOW(), NOW())
        `, [hashedPassword]);
        
        console.log('✅ Admin user created:');
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
    
    // Step 6: Seed database if requested
    if (shouldSeed) {
      console.log('\n📋 Step 6: Seeding database with sample data');
      
      try {
        console.log('Running database seed script...');
        execSync('node scripts/seed-db.js', { stdio: 'inherit' });
        console.log('✅ Database seeding complete');
        
      } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        // Continue setup even if seeding fails
      }
    } else {
      console.log('\n📋 Step 6: Skipping database seeding (use --seed to seed database)');
    }
    
    // Step 7: Final setup steps
    console.log('\n📋 Step 7: Final setup steps');
    
    // Create necessary directories if they don't exist
    const dirs = ['backups', 'docs'];
    
    for (const dir of dirs) {
      const dirPath = path.join(__dirname, '..', dir);
      if (!fs.existsSync(dirPath)) {
        console.log(`Creating directory: ${dir}`);
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }
    
    console.log('✅ Final setup steps complete');
    
    // All done!
    console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║       🎉 DSAC Website Setup Complete! 🎉          ║
║                                                    ║
╚════════════════════════════════════════════════════╝

✅ Database is configured and ready
✅ Admin user is created
${shouldSeed ? '✅ Sample data is loaded' : ''}

🚀 Next steps:

1. Start the application:
   npm run dev

2. Access the website at:
   http://localhost:5000

3. Login with the admin account:
   Username: admin
   Password: admin123

⚠️  IMPORTANT: Change the admin password after first login!
`);
    
  } catch (error) {
    console.error('❌ Setup failed with an unexpected error:', error.message);
    exit(1);
  } finally {
    // Close database connection
    if (pool) {
      await pool.end();
    }
  }
}

// Run the setup
setupProject();