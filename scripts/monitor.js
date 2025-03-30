#!/usr/bin/env node

/**
 * Application Monitoring Script
 * 
 * This script checks the health of the DSAC application:
 * 1. Verifies database connection and tables
 * 2. Checks API endpoints
 * 3. Monitors system resources
 * 4. Generates a health report
 * 
 * Usage: node monitor.js [--interval=<seconds>]
 * Options:
 *   --interval=<seconds> : Run monitoring continuously at the specified interval
 */

const http = require('http');
const { Pool } = require('pg');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { exit } = require('process');

// Parse arguments
const args = process.argv.slice(2);
let interval = null;

for (const arg of args) {
  if (arg.startsWith('--interval=')) {
    interval = parseInt(arg.split('=')[1]);
    
    if (isNaN(interval) || interval < 5) {
      console.error('❌ Invalid interval value. Must be a number >= 5 seconds.');
      exit(1);
    }
  }
}

// Utility functions
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatTime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

function checkSystemResources() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsage = ((usedMem / totalMem) * 100).toFixed(2);
  
  const cpuInfo = os.cpus();
  const cpuCores = cpuInfo.length;
  const cpuModel = cpuInfo[0].model;
  
  const uptime = os.uptime();
  const loadAvg = os.loadavg();
  
  return {
    memory: {
      total: formatBytes(totalMem),
      used: formatBytes(usedMem),
      free: formatBytes(freeMem),
      usagePercentage: memUsage
    },
    cpu: {
      model: cpuModel,
      cores: cpuCores,
      loadAverage: loadAvg
    },
    system: {
      platform: os.platform(),
      release: os.release(),
      uptime: formatTime(uptime)
    }
  };
}

async function checkDatabase() {
  console.log('🔄 Checking database health...');
  
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    // Check connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Get PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    const version = versionResult.rows[0].version.split(',')[0];
    console.log(`✅ Database version: ${version}`);
    
    // Check table counts
    const tableResults = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) AS users_count,
        (SELECT COUNT(*) FROM events) AS events_count,
        (SELECT COUNT(*) FROM event_registrations) AS registrations_count,
        (SELECT COUNT(*) FROM forum_posts) AS posts_count,
        (SELECT COUNT(*) FROM forum_replies) AS replies_count,
        (SELECT COUNT(*) FROM resources) AS resources_count
    `);
    
    const counts = tableResults.rows[0];
    console.log('✅ Table row counts:');
    console.log(`   - Users: ${counts.users_count}`);
    console.log(`   - Events: ${counts.events_count}`);
    console.log(`   - Event Registrations: ${counts.registrations_count}`);
    console.log(`   - Forum Posts: ${counts.posts_count}`);
    console.log(`   - Forum Replies: ${counts.replies_count}`);
    console.log(`   - Resources: ${counts.resources_count}`);
    
    // Check database size
    const sizeResult = await client.query(`
      SELECT pg_size_pretty(pg_database_size($1)) AS size
    `, [process.env.PGDATABASE]);
    
    console.log(`✅ Database size: ${sizeResult.rows[0].size}`);
    
    client.release();
    await pool.end();
    
    return {
      status: 'healthy',
      version,
      tables: counts,
      size: sizeResult.rows[0].size
    };
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    return {
      status: 'error',
      error: error.message
    };
  }
}

async function checkAPI() {
  console.log('🔄 Checking API health...');
  
  const apiEndpoints = [
    { path: '/', method: 'GET', name: 'Home Page' },
    { path: '/api/user', method: 'GET', name: 'Current User' },
    { path: '/api/events', method: 'GET', name: 'Events List' },
    { path: '/api/forum', method: 'GET', name: 'Forum Posts' },
    { path: '/api/resources', method: 'GET', name: 'Resources' },
    { path: '/api/leaderboard', method: 'GET', name: 'Leaderboard' }
  ];
  
  const results = [];
  
  for (const endpoint of apiEndpoints) {
    console.log(`Checking ${endpoint.method} ${endpoint.path}...`);
    
    try {
      const result = await new Promise((resolve) => {
        const options = {
          hostname: 'localhost',
          port: 5000, // Adjust this to your application's port
          path: endpoint.path,
          method: endpoint.method
        };
        
        const startTime = Date.now();
        
        const req = http.request(options, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            resolve({
              endpoint: endpoint.path,
              method: endpoint.method,
              name: endpoint.name,
              statusCode: res.statusCode,
              responseTime: responseTime,
              status: res.statusCode >= 200 && res.statusCode < 300 ? 'healthy' : 'error'
            });
          });
        });
        
        req.on('error', (error) => {
          resolve({
            endpoint: endpoint.path,
            method: endpoint.method,
            name: endpoint.name,
            statusCode: null,
            responseTime: null,
            status: 'error',
            error: error.message
          });
        });
        
        req.end();
      });
      
      if (result.status === 'healthy') {
        console.log(`✅ ${endpoint.name}: Status ${result.statusCode}, Response time ${result.responseTime}ms`);
      } else {
        console.error(`❌ ${endpoint.name}: ${result.error || `Status ${result.statusCode}`}`);
      }
      
      results.push(result);
    } catch (error) {
      console.error(`❌ ${endpoint.name}: ${error.message}`);
      results.push({
        endpoint: endpoint.path,
        method: endpoint.method,
        name: endpoint.name,
        status: 'error',
        error: error.message
      });
    }
  }
  
  return results;
}

async function generateReport() {
  console.log('\n📊 Generating health report...');
  
  const timestamp = new Date().toISOString();
  const dbStatus = await checkDatabase();
  const apiStatus = await checkAPI();
  const systemResources = checkSystemResources();
  
  const overallStatus = 
    dbStatus.status === 'healthy' && 
    apiStatus.every(api => api.status === 'healthy')
      ? 'healthy'
      : 'unhealthy';
  
  const report = {
    timestamp,
    overallStatus,
    database: dbStatus,
    api: apiStatus,
    system: systemResources
  };
  
  // Create reports directory if it doesn't exist
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Write the report to a file
  const reportPath = path.join(reportsDir, `health_report_${timestamp.replace(/:/g, '-')}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Write to latest report file
  const latestReportPath = path.join(reportsDir, 'latest_health_report.json');
  fs.writeFileSync(latestReportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n✅ Health report generated: ${reportPath}`);
  console.log(`✅ Overall status: ${overallStatus.toUpperCase()}`);
  
  return report;
}

async function monitor() {
  console.log(`
╔════════════════════════════════════════════════════╗
║             DSAC Application Monitor               ║
╚════════════════════════════════════════════════════╝
  `);
  
  console.log(`🕒 Monitoring started at: ${new Date().toISOString()}`);
  
  if (interval) {
    console.log(`🔄 Running in continuous mode with ${interval} second interval`);
    
    // Run immediately, then on interval
    await generateReport();
    
    setInterval(async () => {
      console.log(`\n🔄 Running health check at ${new Date().toISOString()}...`);
      await generateReport();
    }, interval * 1000);
  } else {
    console.log('🔄 Running one-time health check...');
    
    const report = await generateReport();
    
    // Exit with appropriate code based on status
    if (report.overallStatus === 'healthy') {
      console.log('\n🎉 All systems are healthy!');
      exit(0);
    } else {
      console.error('\n⚠️  Some systems are unhealthy. Check the report for details.');
      exit(1);
    }
  }
}

// Start monitoring
monitor().catch(error => {
  console.error('❌ Monitoring failed with error:', error);
  exit(1);
});