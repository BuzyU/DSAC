#!/usr/bin/env node

/**
 * Task Automation Script
 * 
 * This script runs predefined tasks for the DSAC website:
 * - Database backup
 * - Data cleanup
 * - Health check
 * - Report generation
 * 
 * Usage: node tasks.js <task-name>
 * Available tasks: backup, cleanup, health-check, report
 */

const { execSync, spawn } = require('child_process');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { exit } = require('process');

// Get task from command line arguments
const task = process.argv[2];

if (!task) {
  console.error('❌ Error: Task name is required');
  console.log('Usage: node tasks.js <task-name>');
  console.log('Available tasks: backup, cleanup, health-check, report');
  exit(1);
}

// Connect to database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Task definitions
const tasks = {
  // Database backup task
  backup: async () => {
    console.log('🔄 Running database backup task...');
    execSync('node scripts/backup-db.js', { stdio: 'inherit' });
    return 'Backup completed successfully';
  },
  
  // Data cleanup task (remove old records, optimize tables)
  cleanup: async () => {
    console.log('🔄 Running data cleanup task...');
    
    // Set of cleanup operations
    const operations = [
      // 1. Remove expired sessions (if session table exists)
      {
        name: 'Check for session table',
        query: `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'session'
          ) as exists
        `,
        onSuccess: async (result) => {
          if (result.rows[0].exists) {
            console.log('   - Found session table, cleaning up expired sessions');
            await pool.query(`DELETE FROM session WHERE expire < NOW()`);
          } else {
            console.log('   - No session table found, skipping session cleanup');
          }
        }
      },
      
      // 2. Delete old event registrations for past events
      {
        name: 'Clean up old event registrations',
        query: `
          DELETE FROM event_registrations
          WHERE event_id IN (
            SELECT id FROM events
            WHERE end_date < NOW() - INTERVAL '30 days'
          )
          RETURNING count(*) as count
        `,
        onSuccess: async (result) => {
          console.log(`   - Removed ${result.rows[0]?.count || 0} old event registrations`);
        }
      },
      
      // 3. Vacuum analyze tables for optimization
      {
        name: 'Optimize database tables',
        query: `
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
        `,
        onSuccess: async (result) => {
          console.log('   - Optimizing database tables');
          
          for (const row of result.rows) {
            const tableName = row.table_name;
            console.log(`      - Vacuuming table: ${tableName}`);
            await pool.query(`VACUUM ANALYZE ${tableName}`);
          }
        }
      }
    ];
    
    // Execute each operation
    for (const op of operations) {
      try {
        console.log(`🔄 ${op.name}...`);
        const result = await pool.query(op.query);
        await op.onSuccess(result);
      } catch (error) {
        console.error(`❌ Error in ${op.name}: ${error.message}`);
      }
    }
    
    return 'Cleanup completed successfully';
  },
  
  // Health check task
  'health-check': async () => {
    console.log('🔄 Running health check task...');
    execSync('node scripts/monitor.js', { stdio: 'inherit' });
    return 'Health check completed successfully';
  },
  
  // Generate usage reports
  report: async () => {
    console.log('🔄 Generating usage reports...');
    
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const date = new Date().toISOString().split('T')[0];
    const reportPath = path.join(reportsDir, `usage_report_${date}.txt`);
    
    // Query sets for different reports
    const reports = [
      {
        name: 'User Statistics',
        query: `
          SELECT
            COUNT(*) as total_users,
            COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
            COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_users_last_30_days
          FROM users
        `
      },
      {
        name: 'Event Statistics',
        query: `
          SELECT
            COUNT(*) as total_events,
            COUNT(CASE WHEN start_date > NOW() THEN 1 END) as upcoming_events,
            COUNT(CASE WHEN start_date < NOW() AND end_date > NOW() THEN 1 END) as ongoing_events,
            COUNT(CASE WHEN end_date < NOW() THEN 1 END) as past_events
          FROM events
        `
      },
      {
        name: 'Forum Activity',
        query: `
          SELECT
            COUNT(*) as total_posts,
            COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as posts_last_30_days,
            (SELECT COUNT(*) FROM forum_replies) as total_replies,
            (SELECT COUNT(*) FROM forum_replies WHERE created_at > NOW() - INTERVAL '30 days') as replies_last_30_days,
            (SELECT COALESCE(SUM(views), 0) FROM forum_posts) as total_views
          FROM forum_posts
        `
      },
      {
        name: 'Top Forum Posts',
        query: `
          SELECT 
            fp.title, 
            u.username, 
            fp.views, 
            COUNT(fr.id) as reply_count
          FROM forum_posts fp
          JOIN users u ON fp.user_id = u.id
          LEFT JOIN forum_replies fr ON fp.id = fr.post_id
          GROUP BY fp.id, fp.title, u.username, fp.views
          ORDER BY fp.views DESC
          LIMIT 10
        `
      },
      {
        name: 'Resource Usage',
        query: `
          SELECT
            COUNT(*) as total_resources,
            COUNT(CASE WHEN resource_type = 'book' THEN 1 END) as books,
            COUNT(CASE WHEN resource_type = 'video' THEN 1 END) as videos,
            COUNT(CASE WHEN resource_type = 'website' THEN 1 END) as websites,
            COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_resources_last_30_days
          FROM resources
        `
      }
    ];
    
    // Generate the report file
    let reportContent = `DSAC WEBSITE USAGE REPORT - ${date}\n`;
    reportContent += '='.repeat(50) + '\n\n';
    
    for (const report of reports) {
      try {
        reportContent += `## ${report.name}\n`;
        reportContent += '-'.repeat(50) + '\n';
        
        const result = await pool.query(report.query);
        
        if (result.rows.length === 1 && Object.keys(result.rows[0]).length > 0) {
          // Single row report (statistics)
          const row = result.rows[0];
          for (const [key, value] of Object.entries(row)) {
            reportContent += `${key.replace(/_/g, ' ')}: ${value}\n`;
          }
        } else if (result.rows.length > 0) {
          // Multi-row report (top items)
          const headers = Object.keys(result.rows[0]);
          
          // Add headers
          reportContent += headers.join(' | ') + '\n';
          reportContent += headers.map(() => '---').join(' | ') + '\n';
          
          // Add data rows
          for (const row of result.rows) {
            reportContent += headers.map(h => row[h]).join(' | ') + '\n';
          }
        } else {
          reportContent += 'No data found\n';
        }
        
        reportContent += '\n';
        
      } catch (error) {
        reportContent += `Error generating report: ${error.message}\n\n`;
      }
    }
    
    // Save report to file
    fs.writeFileSync(reportPath, reportContent);
    
    console.log(`✅ Report generated: ${reportPath}`);
    
    return `Report generated successfully: ${reportPath}`;
  }
};

// Execute the requested task
async function executeTask() {
  try {
    if (!tasks[task]) {
      console.error(`❌ Unknown task: ${task}`);
      console.log('Available tasks: ', Object.keys(tasks).join(', '));
      exit(1);
    }
    
    const result = await tasks[task]();
    console.log(`\n✅ Task '${task}' executed successfully`);
    console.log(`Result: ${result}`);
    
  } catch (error) {
    console.error(`❌ Task '${task}' failed:`, error.message);
    exit(1);
  } finally {
    await pool.end();
  }
}

// Run the task
executeTask();