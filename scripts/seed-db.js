#!/usr/bin/env node

/**
 * Database Seed Script
 * 
 * This script populates the database with sample data for development and testing.
 * It creates:
 * - Sample users with different roles
 * - Events (past, ongoing, upcoming)
 * - Forum posts with replies
 * - Resource links
 * - Contest results for the leaderboard
 */

const { Pool } = require('pg');
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

async function seedDatabase() {
  console.log(`
╔════════════════════════════════════╗
║       Database Seed Script         ║
╚════════════════════════════════════╝
  `);
  
  // Connect to database
  console.log('🔄 Connecting to database...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    client.release();
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error.message);
    exit(1);
  }
  
  // Check if there's already data in the database
  console.log('🔄 Checking existing data...');
  
  try {
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(userCount.rows[0].count);
    
    if (totalUsers > 1) {  // If more than just the admin user
      console.log(`⚠️  Database already contains ${totalUsers} users.`);
      console.log('Continuing will add additional sample data.');
      
      // Proceed automatically in this script, but in production you might want to add a confirmation prompt
    }
  } catch (error) {
    console.error('❌ Error checking existing data:', error.message);
    exit(1);
  }
  
  console.log('\n🔄 Starting database seeding...');
  
  try {
    // 1. Create sample users
    console.log('\n📋 Creating sample users...');
    
    const sampleUsers = [
      {
        username: 'johndoe',
        password: await hashPassword('password123'),
        email: 'john@example.com',
        display_name: 'John Doe',
        role: 'user',
        bio: 'Competitive programmer passionate about algorithms',
        level: 'intermediate'
      },
      {
        username: 'janedoe',
        password: await hashPassword('password123'),
        email: 'jane@example.com',
        display_name: 'Jane Doe',
        role: 'user',
        bio: 'CS student learning data structures',
        level: 'beginner'
      },
      {
        username: 'bobsmith',
        password: await hashPassword('password123'),
        email: 'bob@example.com',
        display_name: 'Bob Smith',
        role: 'user',
        bio: 'Software engineer with 5 years of experience',
        level: 'advanced'
      },
      {
        username: 'alicejones',
        password: await hashPassword('password123'),
        email: 'alice@example.com',
        display_name: 'Alice Jones',
        role: 'user',
        bio: 'AI researcher focusing on algorithms',
        level: 'advanced'
      },
      {
        username: 'moderator',
        password: await hashPassword('password123'),
        email: 'moderator@example.com',
        display_name: 'Club Moderator',
        role: 'moderator',
        bio: 'Helping maintain the DSAC community',
        level: 'advanced'
      }
    ];
    
    for (const user of sampleUsers) {
      // Check if user already exists
      const existingUser = await pool.query('SELECT id FROM users WHERE username = $1', [user.username]);
      
      if (existingUser.rows.length === 0) {
        await pool.query(`
          INSERT INTO users (username, password, email, display_name, role, bio, level, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        `, [user.username, user.password, user.email, user.display_name, user.role, user.bio, user.level]);
        
        console.log(`✅ Created user: ${user.username}`);
      } else {
        console.log(`⚠️  User already exists: ${user.username}`);
      }
    }
    
    // 2. Create sample events
    console.log('\n📋 Creating sample events...');
    
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const twoWeeksFromNow = new Date(now);
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    
    const sampleEvents = [
      {
        title: 'Beginner\'s Algorithms Workshop',
        description: 'Introduction to basic algorithms and data structures. Perfect for beginners who want to learn the fundamentals.',
        location: 'Online (Zoom)',
        event_type: 'workshop',
        capacity: 50,
        start_date: yesterday,
        end_date: tomorrow,
        user_id: 1  // Admin user
      },
      {
        title: 'Monthly Coding Contest',
        description: 'Test your skills in our monthly contest! Problems ranging from easy to hard difficulty.',
        location: 'Online (HackerRank)',
        event_type: 'contest',
        capacity: 100,
        start_date: oneWeekAgo,
        end_date: yesterday,
        user_id: 1  // Admin user
      },
      {
        title: 'Graph Algorithms Deep Dive',
        description: 'Advanced workshop on graph algorithms including DFS, BFS, Dijkstra, and more.',
        location: 'Computer Science Building, Room 302',
        event_type: 'workshop',
        capacity: 30,
        start_date: tomorrow,
        end_date: nextWeek,
        user_id: 1  // Admin user
      },
      {
        title: 'Dynamic Programming Challenge',
        description: 'A special contest focused entirely on dynamic programming problems.',
        location: 'Online (Codeforces)',
        event_type: 'contest',
        capacity: 75,
        start_date: nextWeek,
        end_date: twoWeeksFromNow,
        user_id: 1  // Admin user
      },
      {
        title: 'Mock Interview Session',
        description: 'Practice technical interviews with peers. Focus on data structures and algorithms questions commonly asked in interviews.',
        location: 'Student Center, Conference Room B',
        event_type: 'meetup',
        capacity: 20,
        start_date: twoWeeksFromNow,
        end_date: new Date(twoWeeksFromNow.getTime() + 3 * 60 * 60 * 1000), // 3 hours later
        user_id: 1  // Admin user
      }
    ];
    
    for (const event of sampleEvents) {
      // Check if event already exists
      const existingEvent = await pool.query('SELECT id FROM events WHERE title = $1', [event.title]);
      
      if (existingEvent.rows.length === 0) {
        const result = await pool.query(`
          INSERT INTO events (title, description, location, event_type, capacity, start_date, end_date, user_id, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          RETURNING id
        `, [event.title, event.description, event.location, event.event_type, event.capacity, event.start_date, event.end_date, event.user_id]);
        
        console.log(`✅ Created event: ${event.title}`);
        
        // Store the event ID for creating registrations
        event.id = result.rows[0].id;
      } else {
        console.log(`⚠️  Event already exists: ${event.title}`);
        event.id = existingEvent.rows[0].id;
      }
    }
    
    // 3. Create sample event registrations
    console.log('\n📋 Creating sample event registrations...');
    
    // Get all user IDs
    const userResults = await pool.query('SELECT id FROM users WHERE username != $1', ['admin']);
    const userIds = userResults.rows.map(row => row.id);
    
    // For each event, register some users
    for (const event of sampleEvents) {
      // Skip if event ID is not available
      if (!event.id) continue;
      
      // Register a random number of users
      const registrationCount = Math.floor(Math.random() * userIds.length) + 1;
      
      for (let i = 0; i < registrationCount; i++) {
        const userId = userIds[i];
        
        // Check if registration already exists
        const existingReg = await pool.query(
          'SELECT id FROM event_registrations WHERE event_id = $1 AND user_id = $2',
          [event.id, userId]
        );
        
        if (existingReg.rows.length === 0) {
          await pool.query(`
            INSERT INTO event_registrations (event_id, user_id, created_at)
            VALUES ($1, $2, NOW())
          `, [event.id, userId]);
          
          console.log(`✅ Registered user ${userId} for event: ${event.title}`);
        } else {
          console.log(`⚠️  User ${userId} already registered for event: ${event.title}`);
        }
      }
    }
    
    // 4. Create sample contest results for past contests
    console.log('\n📋 Creating sample contest results...');
    
    const pastContests = sampleEvents.filter(event => 
      event.event_type === 'contest' && event.end_date < now
    );
    
    for (const contest of pastContests) {
      // Get registrations for this contest
      const registrations = await pool.query(
        'SELECT user_id FROM event_registrations WHERE event_id = $1',
        [contest.id]
      );
      
      for (const reg of registrations.rows) {
        // Generate a random score between 0 and 100
        const score = Math.floor(Math.random() * 100);
        
        // Generate a random position
        const position = Math.floor(Math.random() * registrations.rows.length) + 1;
        
        // Check if result already exists
        const existingResult = await pool.query(
          'SELECT id FROM contest_results WHERE event_id = $1 AND user_id = $2',
          [contest.id, reg.user_id]
        );
        
        if (existingResult.rows.length === 0) {
          await pool.query(`
            INSERT INTO contest_results (event_id, user_id, score, position, created_at)
            VALUES ($1, $2, $3, $4, NOW())
          `, [contest.id, reg.user_id, score, position]);
          
          console.log(`✅ Added contest result for user ${reg.user_id}: score ${score}, position ${position}`);
        } else {
          console.log(`⚠️  Contest result already exists for user ${reg.user_id}`);
        }
      }
    }
    
    // 5. Create sample forum posts
    console.log('\n📋 Creating sample forum posts...');
    
    const samplePosts = [
      {
        title: 'Help with binary search implementation',
        content: 'I\'m struggling with implementing binary search correctly. My current algorithm keeps giving incorrect results for edge cases. Can someone help me identify the issues?',
        category: 'question',
        difficulty: 'beginner',
        user_id: userIds[0]
      },
      {
        title: 'Dynamic Programming vs Greedy Algorithms',
        content: 'I\'d like to understand the key differences between DP and greedy approaches. When should I use one over the other?',
        category: 'discussion',
        difficulty: 'intermediate',
        user_id: userIds[1]
      },
      {
        title: 'Advanced graph traversal techniques',
        content: 'Beyond basic DFS and BFS, what advanced graph traversal techniques should I know for competitive programming?',
        category: 'discussion',
        difficulty: 'advanced',
        user_id: userIds[2]
      },
      {
        title: 'Preparing for coding interviews',
        content: 'I have technical interviews coming up with major tech companies. What data structures and algorithms should I focus on?',
        category: 'advice',
        difficulty: 'intermediate',
        user_id: userIds[3]
      },
      {
        title: 'Time complexity analysis of quicksort',
        content: 'Can someone explain the best, worst, and average case time complexity of quicksort in detail?',
        category: 'question',
        difficulty: 'intermediate',
        user_id: userIds[0]
      }
    ];
    
    const forumPostIds = [];
    
    for (const post of samplePosts) {
      // Check if post already exists
      const existingPost = await pool.query('SELECT id FROM forum_posts WHERE title = $1', [post.title]);
      
      if (existingPost.rows.length === 0) {
        const result = await pool.query(`
          INSERT INTO forum_posts (title, content, category, difficulty, user_id, views, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          RETURNING id
        `, [post.title, post.content, post.category, post.difficulty, post.user_id, Math.floor(Math.random() * 50)]);
        
        console.log(`✅ Created forum post: ${post.title}`);
        forumPostIds.push(result.rows[0].id);
      } else {
        console.log(`⚠️  Forum post already exists: ${post.title}`);
        forumPostIds.push(existingPost.rows[0].id);
      }
    }
    
    // 6. Create sample forum replies
    console.log('\n📋 Creating sample forum replies...');
    
    const sampleReplies = [
      {
        post_id: forumPostIds[0],
        content: 'Make sure you\'re handling the middle index calculation correctly. Try using `mid = low + (high - low) / 2` to avoid integer overflow.',
        user_id: userIds[2],
        upvotes: 5,
        is_best_answer: true
      },
      {
        post_id: forumPostIds[0],
        content: 'Check your termination condition as well. It should be `while (low <= high)` not `while (low < high)`.',
        user_id: userIds[3],
        upvotes: 3,
        is_best_answer: false
      },
      {
        post_id: forumPostIds[1],
        content: 'Dynamic Programming is used when the problem has overlapping subproblems and optimal substructure. Greedy algorithms make locally optimal choices at each step.',
        user_id: userIds[0],
        upvotes: 7,
        is_best_answer: true
      },
      {
        post_id: forumPostIds[1],
        content: 'A classic example: coin change problem with denominations 1, 4, 6. Greedy would choose 6, 1, 1 (total 8), but optimal is 4, 4 (total 8).',
        user_id: userIds[2],
        upvotes: 4,
        is_best_answer: false
      },
      {
        post_id: forumPostIds[2],
        content: 'Look into Topological Sort, Strongly Connected Components (Tarjan\'s algorithm), and A* search algorithm.',
        user_id: userIds[1],
        upvotes: 6,
        is_best_answer: false
      },
      {
        post_id: forumPostIds[3],
        content: 'Focus on hash tables, trees, graphs, and dynamic programming. Practice problems on LeetCode and HackerRank.',
        user_id: userIds[2],
        upvotes: 8,
        is_best_answer: true
      },
      {
        post_id: forumPostIds[4],
        content: 'Best case: O(n log n) when the pivot divides the array evenly. Worst case: O(n²) when the array is already sorted. Average case: O(n log n).',
        user_id: userIds[3],
        upvotes: 5,
        is_best_answer: false
      }
    ];
    
    for (const reply of sampleReplies) {
      // Check if reply already exists (based on content and post_id)
      const existingReply = await pool.query(
        'SELECT id FROM forum_replies WHERE post_id = $1 AND content = $2',
        [reply.post_id, reply.content]
      );
      
      if (existingReply.rows.length === 0) {
        await pool.query(`
          INSERT INTO forum_replies (post_id, content, user_id, upvotes, is_best_answer, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        `, [reply.post_id, reply.content, reply.user_id, reply.upvotes, reply.is_best_answer]);
        
        console.log(`✅ Created forum reply for post ID ${reply.post_id}`);
      } else {
        console.log(`⚠️  Forum reply already exists for post ID ${reply.post_id}`);
      }
    }
    
    // 7. Create sample resources
    console.log('\n📋 Creating sample resources...');
    
    const sampleResources = [
      {
        title: 'Introduction to Algorithms',
        description: 'Comprehensive textbook covering a broad range of algorithms',
        link: 'https://mitpress.mit.edu/books/introduction-algorithms-third-edition',
        resource_type: 'book',
        content: 'This classic textbook covers a broad range of algorithms in depth, yet makes their design and analysis accessible to all levels of readers.',
        user_id: 1 // Admin user
      },
      {
        title: 'Visualgo - Algorithm Visualization',
        description: 'Interactive visualizations of various data structures and algorithms',
        link: 'https://visualgo.net/',
        resource_type: 'website',
        content: 'VisuAlgo was conceptualized in 2011 by Dr Steven Halim as a tool to help his students better understand data structures and algorithms, by allowing them to learn the basics on their own and at their own pace.',
        user_id: 1 // Admin user
      },
      {
        title: 'Leetcode',
        description: 'Platform for preparing technical coding interviews',
        link: 'https://leetcode.com/',
        resource_type: 'website',
        content: 'LeetCode is the best platform to help you enhance your skills, expand your knowledge and prepare for technical interviews.',
        user_id: 1 // Admin user
      },
      {
        title: 'Graph Algorithms Tutorial',
        description: 'Comprehensive video tutorial on graph algorithms',
        link: 'https://www.youtube.com/watch?v=DgXR2OWQnLc',
        resource_type: 'video',
        content: 'This tutorial covers DFS, BFS, Dijkstra\'s algorithm, Bellman-Ford, Floyd-Warshall, and more.',
        user_id: 1 // Admin user
      },
      {
        title: 'Dynamic Programming - A Comprehensive Introduction',
        description: 'Article explaining the concepts of dynamic programming',
        link: 'https://www.freecodecamp.org/news/demystifying-dynamic-programming-3efafb8d4296/',
        resource_type: 'article',
        content: 'This article breaks down the concept of dynamic programming, providing examples and step-by-step solutions to common DP problems.',
        user_id: 1 // Admin user
      }
    ];
    
    for (const resource of sampleResources) {
      // Check if resource already exists
      const existingResource = await pool.query('SELECT id FROM resources WHERE title = $1', [resource.title]);
      
      if (existingResource.rows.length === 0) {
        await pool.query(`
          INSERT INTO resources (title, description, link, resource_type, content, user_id, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        `, [resource.title, resource.description, resource.link, resource.resource_type, resource.content, resource.user_id]);
        
        console.log(`✅ Created resource: ${resource.title}`);
      } else {
        console.log(`⚠️  Resource already exists: ${resource.title}`);
      }
    }
    
    console.log(`
╔════════════════════════════════════╗
║    Database Seeding Complete! 🎉   ║
╚════════════════════════════════════╝
    `);
    
    console.log('✅ Added sample users, events, forum posts, replies, and resources');
    console.log('✅ The application is now populated with development data');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();