import { 
  User, InsertUser, 
  Event, InsertEvent, 
  EventRegistration, InsertEventRegistration,
  ContestResult, InsertContestResult,
  ForumPost, InsertForumPost,
  ForumReply, InsertForumReply,
  Resource, InsertResource
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import pg from 'pg';
import connectPg from "connect-pg-simple";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Event operations
  getAllEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Event registration operations
  getEventRegistration(eventId: number, userId: number): Promise<EventRegistration | undefined>;
  createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration>;
  getAllEventRegistrations(eventId: number): Promise<EventRegistration[]>;
  deleteEventRegistration(id: number): Promise<boolean>;
  
  // Contest result operations
  getContestResults(eventId: number): Promise<ContestResult[]>;
  createContestResult(result: InsertContestResult): Promise<ContestResult>;
  updateContestResult(id: number, resultData: Partial<ContestResult>): Promise<ContestResult | undefined>;
  deleteContestResult(id: number): Promise<boolean>;
  
  // Leaderboard operations
  getLeaderboard(): Promise<any[]>;
  updateLeaderboardEntry(userId: number, data: { score?: number; contestCount?: number; topProblem?: string }): Promise<any>;
  
  // Forum operations
  getAllForumPosts(): Promise<ForumPost[]>;
  getForumPost(id: number): Promise<ForumPost | undefined>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  updateForumPost(id: number, postData: Partial<ForumPost>): Promise<ForumPost | undefined>;
  deleteForumPost(id: number): Promise<boolean>;
  incrementForumPostViews(id: number): Promise<void>;
  
  // Forum reply operations
  getForumReplies(postId: number): Promise<ForumReply[]>;
  getForumReply(id: number): Promise<ForumReply | undefined>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  updateForumReply(id: number, replyData: Partial<ForumReply>): Promise<ForumReply | undefined>;
  deleteForumReply(id: number): Promise<boolean>;
  upvoteForumReply(id: number): Promise<ForumReply>;
  markAsBestAnswer(postId: number, replyId: number): Promise<ForumReply>;
  
  // Resource operations
  getAllResources(): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resourceData: Partial<Resource>): Promise<Resource | undefined>;
  deleteResource(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.Store;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private eventRegistrations: Map<number, EventRegistration>;
  private contestResults: Map<number, ContestResult>;
  private forumPosts: Map<number, ForumPost>;
  private forumReplies: Map<number, ForumReply>;
  private resources: Map<number, Resource>;
  
  sessionStore: session.Store;
  
  // Counters for IDs
  private userId: number;
  private eventId: number;
  private eventRegistrationId: number;
  private contestResultId: number;
  private forumPostId: number;
  private forumReplyId: number;
  private resourceId: number;
  
  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.eventRegistrations = new Map();
    this.contestResults = new Map();
    this.forumPosts = new Map();
    this.forumReplies = new Map();
    this.resources = new Map();
    
    this.userId = 1;
    this.eventId = 1;
    this.eventRegistrationId = 1;
    this.contestResultId = 1;
    this.forumPostId = 1;
    this.forumReplyId = 1;
    this.resourceId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Add only an admin user to start with
    const adminId = this.userId++;
    const adminPassword = "$2b$10$X4kv7j5ZcG39WgogSl1Z.edYQTThGZpLJ/zqxK5eTnStY3olD5Wm2"; // "admin123"
    this.users.set(adminId, {
      id: adminId,
      username: "admin",
      password: adminPassword,
      displayName: "Admin",
      email: "admin@dsac.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      bio: "Site administrator",
      role: "admin",
      level: "advanced",
      createdAt: new Date()
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      role: "member", 
      level: "beginner",
      createdAt: now,
      avatar: insertUser.avatar || null,
      bio: insertUser.bio || null
    };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Event operations
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventId++;
    const now = new Date();
    const event: Event = { ...insertEvent, id, createdAt: now };
    this.events.set(id, event);
    return event;
  }
  
  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...eventData };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
  
  // Event registration operations
  async getEventRegistration(eventId: number, userId: number): Promise<EventRegistration | undefined> {
    return Array.from(this.eventRegistrations.values()).find(
      (reg) => reg.eventId === eventId && reg.userId === userId
    );
  }
  
  async createEventRegistration(insertRegistration: InsertEventRegistration): Promise<EventRegistration> {
    const id = this.eventRegistrationId++;
    const now = new Date();
    const registration: EventRegistration = { 
      ...insertRegistration, 
      id, 
      registeredAt: now 
    };
    this.eventRegistrations.set(id, registration);
    return registration;
  }
  
  async getAllEventRegistrations(eventId: number): Promise<EventRegistration[]> {
    return Array.from(this.eventRegistrations.values())
      .filter(registration => registration.eventId === eventId)
      .sort((a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime());
  }
  
  async deleteEventRegistration(id: number): Promise<boolean> {
    return this.eventRegistrations.delete(id);
  }
  
  // Contest result operations
  async getContestResults(eventId: number): Promise<ContestResult[]> {
    return Array.from(this.contestResults.values())
      .filter((result) => result.eventId === eventId)
      .sort((a, b) => b.score - a.score);
  }
  
  async createContestResult(insertResult: InsertContestResult): Promise<ContestResult> {
    const id = this.contestResultId++;
    const now = new Date();
    const result: ContestResult = { 
      ...insertResult, 
      id, 
      position: insertResult.position || null,
      createdAt: now 
    };
    this.contestResults.set(id, result);
    return result;
  }
  
  async updateContestResult(id: number, resultData: Partial<ContestResult>): Promise<ContestResult | undefined> {
    const result = this.contestResults.get(id);
    if (!result) return undefined;
    
    const updatedResult = { ...result, ...resultData };
    this.contestResults.set(id, updatedResult);
    return updatedResult;
  }
  
  async deleteContestResult(id: number): Promise<boolean> {
    return this.contestResults.delete(id);
  }
  
  // Leaderboard operations
  async getLeaderboard(): Promise<any[]> {
    // Calculate scores from contest results
    const userScores = new Map<number, {
      userId: number;
      totalScore: number;
      contestCount: number;
      topProblem?: string;
    }>();
    
    // Gather all contest results
    for (const result of this.contestResults.values()) {
      const currentData = userScores.get(result.userId) || {
        userId: result.userId,
        totalScore: 0,
        contestCount: 0
      };
      
      currentData.totalScore += result.score;
      currentData.contestCount += 1;
      
      userScores.set(result.userId, currentData);
    }
    
    // Get user data for each scored user
    const leaderboard = await Promise.all(
      Array.from(userScores.entries()).map(async ([userId, scoreData]) => {
        const user = await this.getUser(userId);
        if (!user) return null;
        
        return {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          level: user.level,
          score: scoreData.totalScore,
          contestCount: scoreData.contestCount,
          topProblem: this.getRandomTopProblem() // Placeholder for demonstration
        };
      })
    );
    
    // Filter out null entries and sort by score
    return leaderboard
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score);
  }
  
  private getRandomTopProblem(): string {
    const problems = ['Binary Tree', 'DP', 'Graphs', 'Backtracking', 'Greedy', 'BFS/DFS'];
    return problems[Math.floor(Math.random() * problems.length)];
  }
  
  async updateLeaderboardEntry(userId: number, data: { score?: number; contestCount?: number; topProblem?: string }): Promise<any> {
    // Since we calculate leaderboard dynamically from contest results, 
    // this method would in a real implementation update specific user rankings
    // For this in-memory implementation, we can add a new contest result to affect the leaderboard
    
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Create a new contest result to reflect the leaderboard change
    if (data.score) {
      const now = new Date();
      const id = this.contestResultId++;
      const result: ContestResult = {
        id,
        eventId: 1, // Use a placeholder event ID
        userId,
        position: null,
        score: data.score,
        createdAt: now
      };
      this.contestResults.set(id, result);
    }
    
    // Return current leaderboard entry for this user
    const leaderboard = await this.getLeaderboard();
    return leaderboard.find(entry => entry.id === userId) || null;
  }
  
  // Forum operations
  async getAllForumPosts(): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getForumPost(id: number): Promise<ForumPost | undefined> {
    return this.forumPosts.get(id);
  }
  
  async createForumPost(insertPost: InsertForumPost): Promise<ForumPost> {
    const id = this.forumPostId++;
    const now = new Date();
    const post: ForumPost = { 
      ...insertPost, 
      id, 
      views: 0,
      tags: insertPost.tags || null,
      createdAt: now,
      updatedAt: now
    };
    this.forumPosts.set(id, post);
    return post;
  }
  
  async updateForumPost(id: number, postData: Partial<ForumPost>): Promise<ForumPost | undefined> {
    const post = this.forumPosts.get(id);
    if (!post) return undefined;
    
    const now = new Date();
    const updatedPost = { ...post, ...postData, updatedAt: now };
    this.forumPosts.set(id, updatedPost);
    return updatedPost;
  }
  
  async deleteForumPost(id: number): Promise<boolean> {
    // Delete all replies to this post first
    for (const [replyId, reply] of this.forumReplies.entries()) {
      if (reply.postId === id) {
        this.forumReplies.delete(replyId);
      }
    }
    
    return this.forumPosts.delete(id);
  }
  
  async incrementForumPostViews(id: number): Promise<void> {
    const post = this.forumPosts.get(id);
    if (post) {
      post.views += 1;
      this.forumPosts.set(id, post);
    }
  }
  
  // Forum reply operations
  async getForumReplies(postId: number): Promise<ForumReply[]> {
    return Array.from(this.forumReplies.values())
      .filter((reply) => reply.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  
  async getForumReply(id: number): Promise<ForumReply | undefined> {
    return this.forumReplies.get(id);
  }
  
  async createForumReply(insertReply: InsertForumReply): Promise<ForumReply> {
    const id = this.forumReplyId++;
    const now = new Date();
    const reply: ForumReply = { 
      ...insertReply, 
      id, 
      upvotes: 0,
      isBestAnswer: false,
      createdAt: now,
      updatedAt: now
    };
    this.forumReplies.set(id, reply);
    return reply;
  }
  
  async upvoteForumReply(id: number): Promise<ForumReply> {
    const reply = this.forumReplies.get(id);
    if (!reply) {
      throw new Error("Reply not found");
    }
    
    reply.upvotes += 1;
    this.forumReplies.set(id, reply);
    return reply;
  }
  
  async updateForumReply(id: number, replyData: Partial<ForumReply>): Promise<ForumReply | undefined> {
    const reply = this.forumReplies.get(id);
    if (!reply) return undefined;
    
    const now = new Date();
    const updatedReply = { ...reply, ...replyData, updatedAt: now };
    this.forumReplies.set(id, updatedReply);
    return updatedReply;
  }
  
  async deleteForumReply(id: number): Promise<boolean> {
    return this.forumReplies.delete(id);
  }
  
  async markAsBestAnswer(postId: number, replyId: number): Promise<ForumReply> {
    // Reset any existing best answers for this post
    for (const [id, reply] of this.forumReplies.entries()) {
      if (reply.postId === postId && reply.isBestAnswer) {
        reply.isBestAnswer = false;
        this.forumReplies.set(id, reply);
      }
    }
    
    // Mark the new best answer
    const reply = this.forumReplies.get(replyId);
    if (!reply) {
      throw new Error("Reply not found");
    }
    
    reply.isBestAnswer = true;
    this.forumReplies.set(replyId, reply);
    return reply;
  }
  
  // Resource operations
  async getAllResources(): Promise<Resource[]> {
    return Array.from(this.resources.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getResource(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }
  
  async createResource(insertResource: InsertResource): Promise<Resource> {
    const id = this.resourceId++;
    const now = new Date();
    const resource: Resource = { 
      ...insertResource, 
      id, 
      link: insertResource.link || null,
      content: insertResource.content || null,
      createdAt: now,
      updatedAt: now
    };
    this.resources.set(id, resource);
    return resource;
  }
  
  async updateResource(id: number, resourceData: Partial<Resource>): Promise<Resource | undefined> {
    const resource = this.resources.get(id);
    if (!resource) return undefined;
    
    const now = new Date();
    const updatedResource = { ...resource, ...resourceData, updatedAt: now };
    this.resources.set(id, updatedResource);
    return updatedResource;
  }
  
  async deleteResource(id: number): Promise<boolean> {
    return this.resources.delete(id);
  }
}

// PostgreSQL storage implementation
export class PostgreSQLStorage implements IStorage {
  private pool: pg.Pool;
  sessionStore: session.Store;

  constructor() {
    this.pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    this.sessionStore = new PostgresSessionStore({
      pool: this.pool,
      createTableIfMissing: true
    });
    
    // Initialize tables
    this.initTables().catch(error => {
      console.error("Failed to initialize database tables:", error);
    });
  }

  private async initTables() {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          display_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          avatar TEXT,
          bio TEXT,
          role VARCHAR(20) NOT NULL DEFAULT 'member',
          level VARCHAR(20) NOT NULL DEFAULT 'beginner',
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        )
      `);

      // Create events table
      await client.query(`
        CREATE TABLE IF NOT EXISTS events (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          date TIMESTAMP WITH TIME ZONE NOT NULL,
          event_type VARCHAR(50) NOT NULL,
          duration INTEGER NOT NULL,
          location VARCHAR(255) NOT NULL,
          created_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        )
      `);

      // Create event_registrations table
      await client.query(`
        CREATE TABLE IF NOT EXISTS event_registrations (
          id SERIAL PRIMARY KEY,
          event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          UNIQUE(event_id, user_id)
        )
      `);

      // Create contest_results table
      await client.query(`
        CREATE TABLE IF NOT EXISTS contest_results (
          id SERIAL PRIMARY KEY,
          event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          score INTEGER NOT NULL,
          position INTEGER,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        )
      `);

      // Create forum_posts table
      await client.query(`
        CREATE TABLE IF NOT EXISTS forum_posts (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          views INTEGER NOT NULL DEFAULT 0,
          tags TEXT[],
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        )
      `);

      // Create forum_replies table
      await client.query(`
        CREATE TABLE IF NOT EXISTS forum_replies (
          id SERIAL PRIMARY KEY,
          post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          content TEXT NOT NULL,
          upvotes INTEGER NOT NULL DEFAULT 0,
          is_best_answer BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        )
      `);

      // Create resources table
      await client.query(`
        CREATE TABLE IF NOT EXISTS resources (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          link TEXT,
          content TEXT,
          resource_type VARCHAR(50) NOT NULL,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        )
      `);

      // Check if admin user exists, if not create one
      const adminResult = await client.query('SELECT * FROM users WHERE username = $1', ['admin']);
      if (adminResult.rows.length === 0) {
        // Using the same hashed password as MemStorage
        const adminPassword = "$2b$10$X4kv7j5ZcG39WgogSl1Z.edYQTThGZpLJ/zqxK5eTnStY3olD5Wm2"; // "admin123"
        await client.query(`
          INSERT INTO users (username, password, display_name, email, avatar, bio, role, level)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          'admin',
          adminPassword,
          'Admin',
          'admin@dsac.com',
          'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
          'Site administrator',
          'admin',
          'advanced'
        ]);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return undefined;
    return this.mapUserFromDB(result.rows[0]);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return undefined;
    return this.mapUserFromDB(result.rows[0]);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return undefined;
    return this.mapUserFromDB(result.rows[0]);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.pool.query(`
      INSERT INTO users (username, password, display_name, email, avatar, bio, role, level)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      insertUser.username,
      insertUser.password,
      insertUser.displayName,
      insertUser.email,
      insertUser.avatar || null,
      insertUser.bio || null,
      'member', // Default role
      'beginner' // Default level
    ]);
    
    return this.mapUserFromDB(result.rows[0]);
  }

  async getAllUsers(): Promise<User[]> {
    const result = await this.pool.query('SELECT * FROM users ORDER BY display_name');
    return result.rows.map(row => this.mapUserFromDB(row));
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    // Build dynamic update query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (userData.username !== undefined) {
      updates.push(`username = $${paramIndex++}`);
      values.push(userData.username);
    }
    
    if (userData.password !== undefined) {
      updates.push(`password = $${paramIndex++}`);
      values.push(userData.password);
    }
    
    if (userData.displayName !== undefined) {
      updates.push(`display_name = $${paramIndex++}`);
      values.push(userData.displayName);
    }
    
    if (userData.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(userData.email);
    }
    
    if (userData.avatar !== undefined) {
      updates.push(`avatar = $${paramIndex++}`);
      values.push(userData.avatar);
    }
    
    if (userData.bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`);
      values.push(userData.bio);
    }
    
    if (userData.role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      values.push(userData.role);
    }
    
    if (userData.level !== undefined) {
      updates.push(`level = $${paramIndex++}`);
      values.push(userData.level);
    }
    
    if (updates.length === 0) return this.getUser(id);
    
    values.push(id);
    const queryText = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await this.pool.query(queryText, values);
    if (result.rows.length === 0) return undefined;
    return this.mapUserFromDB(result.rows[0]);
  }

  // Helper methods for mapping database rows to types
  private mapUserFromDB(row: any): User {
    return {
      id: row.id,
      username: row.username,
      password: row.password,
      displayName: row.display_name,
      email: row.email,
      avatar: row.avatar,
      bio: row.bio,
      role: row.role,
      level: row.level,
      createdAt: new Date(row.created_at)
    };
  }

  // Event operations
  async getAllEvents(): Promise<Event[]> {
    const result = await this.pool.query('SELECT * FROM events ORDER BY date');
    return result.rows.map(row => this.mapEventFromDB(row));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const result = await this.pool.query('SELECT * FROM events WHERE id = $1', [id]);
    if (result.rows.length === 0) return undefined;
    return this.mapEventFromDB(result.rows[0]);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const result = await this.pool.query(`
      INSERT INTO events (title, description, date, event_type, duration, location, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      insertEvent.title,
      insertEvent.description,
      insertEvent.date,
      insertEvent.eventType,
      insertEvent.duration,
      insertEvent.location,
      insertEvent.createdBy
    ]);
    
    return this.mapEventFromDB(result.rows[0]);
  }

  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (eventData.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(eventData.title);
    }
    
    if (eventData.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(eventData.description);
    }
    
    if (eventData.date !== undefined) {
      updates.push(`date = $${paramIndex++}`);
      values.push(eventData.date);
    }
    
    if (eventData.eventType !== undefined) {
      updates.push(`event_type = $${paramIndex++}`);
      values.push(eventData.eventType);
    }
    
    if (eventData.duration !== undefined) {
      updates.push(`duration = $${paramIndex++}`);
      values.push(eventData.duration);
    }
    
    if (eventData.location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      values.push(eventData.location);
    }
    
    if (eventData.createdBy !== undefined) {
      updates.push(`created_by = $${paramIndex++}`);
      values.push(eventData.createdBy);
    }
    
    if (updates.length === 0) return this.getEvent(id);
    
    values.push(id);
    const queryText = `
      UPDATE events
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await this.pool.query(queryText, values);
    if (result.rows.length === 0) return undefined;
    return this.mapEventFromDB(result.rows[0]);
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  private mapEventFromDB(row: any): Event {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      date: new Date(row.date),
      eventType: row.event_type,
      duration: row.duration,
      location: row.location,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at)
    };
  }

  // Event registration operations
  async getEventRegistration(eventId: number, userId: number): Promise<EventRegistration | undefined> {
    const result = await this.pool.query(
      'SELECT * FROM event_registrations WHERE event_id = $1 AND user_id = $2',
      [eventId, userId]
    );
    if (result.rows.length === 0) return undefined;
    return this.mapEventRegistrationFromDB(result.rows[0]);
  }

  async createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration> {
    const result = await this.pool.query(`
      INSERT INTO event_registrations (event_id, user_id)
      VALUES ($1, $2)
      RETURNING *
    `, [
      registration.eventId,
      registration.userId
    ]);
    
    return this.mapEventRegistrationFromDB(result.rows[0]);
  }

  async getAllEventRegistrations(eventId: number): Promise<EventRegistration[]> {
    const result = await this.pool.query(
      'SELECT * FROM event_registrations WHERE event_id = $1 ORDER BY registered_at',
      [eventId]
    );
    return result.rows.map(row => this.mapEventRegistrationFromDB(row));
  }

  async deleteEventRegistration(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM event_registrations WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  private mapEventRegistrationFromDB(row: any): EventRegistration {
    return {
      id: row.id,
      eventId: row.event_id,
      userId: row.user_id,
      registeredAt: new Date(row.registered_at)
    };
  }

  // Contest result operations
  async getContestResults(eventId: number): Promise<ContestResult[]> {
    const result = await this.pool.query(
      'SELECT * FROM contest_results WHERE event_id = $1 ORDER BY score DESC',
      [eventId]
    );
    return result.rows.map(row => this.mapContestResultFromDB(row));
  }

  async createContestResult(result: InsertContestResult): Promise<ContestResult> {
    const queryResult = await this.pool.query(`
      INSERT INTO contest_results (event_id, user_id, score, position)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      result.eventId,
      result.userId,
      result.score,
      result.position || null
    ]);
    
    return this.mapContestResultFromDB(queryResult.rows[0]);
  }

  async updateContestResult(id: number, resultData: Partial<ContestResult>): Promise<ContestResult | undefined> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (resultData.score !== undefined) {
      updates.push(`score = $${paramIndex++}`);
      values.push(resultData.score);
    }
    
    if (resultData.position !== undefined) {
      updates.push(`position = $${paramIndex++}`);
      values.push(resultData.position);
    }
    
    if (updates.length === 0) {
      const result = await this.pool.query('SELECT * FROM contest_results WHERE id = $1', [id]);
      if (result.rows.length === 0) return undefined;
      return this.mapContestResultFromDB(result.rows[0]);
    }
    
    values.push(id);
    const queryText = `
      UPDATE contest_results
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await this.pool.query(queryText, values);
    if (result.rows.length === 0) return undefined;
    return this.mapContestResultFromDB(result.rows[0]);
  }

  async deleteContestResult(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM contest_results WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  private mapContestResultFromDB(row: any): ContestResult {
    return {
      id: row.id,
      eventId: row.event_id,
      userId: row.user_id,
      score: row.score,
      position: row.position,
      createdAt: new Date(row.created_at)
    };
  }

  // Leaderboard operations
  async getLeaderboard(): Promise<any[]> {
    // Get top performers from contest results
    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.display_name AS "displayName", 
        u.avatar, 
        u.level,
        SUM(cr.score) AS score,
        COUNT(DISTINCT cr.event_id) AS "contestCount",
        CASE 
          WHEN random() < 0.2 THEN 'Binary Tree'
          WHEN random() < 0.4 THEN 'DP'
          WHEN random() < 0.6 THEN 'Graphs'
          WHEN random() < 0.8 THEN 'Backtracking'
          ELSE 'Greedy'
        END AS "topProblem" -- Random problem type for demonstration
      FROM 
        users u
      JOIN 
        contest_results cr ON u.id = cr.user_id
      GROUP BY 
        u.id
      ORDER BY 
        score DESC
    `;
    
    const result = await this.pool.query(query);
    return result.rows;
  }

  async updateLeaderboardEntry(userId: number, data: { score?: number; contestCount?: number; topProblem?: string }): Promise<any> {
    // Since we calculate leaderboard dynamically from contest results, 
    // we need to add a contest result entry to affect the leaderboard
    if (data.score) {
      await this.createContestResult({
        eventId: 1, // Use a placeholder event ID
        userId,
        score: data.score,
        position: null
      });
    }
    
    // Return the updated leaderboard entry for this user
    const result = await this.pool.query(`
      SELECT 
        u.id, 
        u.username, 
        u.display_name AS "displayName", 
        u.avatar, 
        u.level,
        SUM(cr.score) AS score,
        COUNT(DISTINCT cr.event_id) AS "contestCount",
        CASE 
          WHEN random() < 0.2 THEN 'Binary Tree'
          WHEN random() < 0.4 THEN 'DP'
          WHEN random() < 0.6 THEN 'Graphs'
          WHEN random() < 0.8 THEN 'Backtracking'
          ELSE 'Greedy'
        END AS "topProblem"
      FROM 
        users u
      LEFT JOIN 
        contest_results cr ON u.id = cr.user_id
      WHERE 
        u.id = $1
      GROUP BY 
        u.id
    `, [userId]);
    
    if (result.rows.length === 0) return null;
    return result.rows[0];
  }

  // Forum operations
  async getAllForumPosts(): Promise<ForumPost[]> {
    const result = await this.pool.query('SELECT * FROM forum_posts ORDER BY created_at DESC');
    return result.rows.map(row => this.mapForumPostFromDB(row));
  }

  async getForumPost(id: number): Promise<ForumPost | undefined> {
    const result = await this.pool.query('SELECT * FROM forum_posts WHERE id = $1', [id]);
    if (result.rows.length === 0) return undefined;
    return this.mapForumPostFromDB(result.rows[0]);
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const result = await this.pool.query(`
      INSERT INTO forum_posts (title, content, user_id, tags)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      post.title,
      post.content,
      post.userId,
      post.tags || null
    ]);
    
    return this.mapForumPostFromDB(result.rows[0]);
  }

  async updateForumPost(id: number, postData: Partial<ForumPost>): Promise<ForumPost | undefined> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (postData.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(postData.title);
    }
    
    if (postData.content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(postData.content);
    }
    
    if (postData.tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(postData.tags);
    }
    
    updates.push(`updated_at = NOW()`);
    
    if (updates.length === 0) return this.getForumPost(id);
    
    values.push(id);
    const queryText = `
      UPDATE forum_posts
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await this.pool.query(queryText, values);
    if (result.rows.length === 0) return undefined;
    return this.mapForumPostFromDB(result.rows[0]);
  }

  async deleteForumPost(id: number): Promise<boolean> {
    // All associated forum replies will be automatically deleted because of CASCADE
    const result = await this.pool.query('DELETE FROM forum_posts WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  async incrementForumPostViews(id: number): Promise<void> {
    await this.pool.query('UPDATE forum_posts SET views = views + 1 WHERE id = $1', [id]);
  }

  private mapForumPostFromDB(row: any): ForumPost {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      userId: row.user_id,
      views: row.views,
      tags: row.tags,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  // Forum reply operations
  async getForumReplies(postId: number): Promise<ForumReply[]> {
    const result = await this.pool.query(
      'SELECT * FROM forum_replies WHERE post_id = $1 ORDER BY created_at',
      [postId]
    );
    return result.rows.map(row => this.mapForumReplyFromDB(row));
  }

  async getForumReply(id: number): Promise<ForumReply | undefined> {
    const result = await this.pool.query('SELECT * FROM forum_replies WHERE id = $1', [id]);
    if (result.rows.length === 0) return undefined;
    return this.mapForumReplyFromDB(result.rows[0]);
  }

  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    const result = await this.pool.query(`
      INSERT INTO forum_replies (post_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [
      reply.postId,
      reply.userId,
      reply.content
    ]);
    
    return this.mapForumReplyFromDB(result.rows[0]);
  }

  async upvoteForumReply(id: number): Promise<ForumReply> {
    const result = await this.pool.query(
      'UPDATE forum_replies SET upvotes = upvotes + 1 WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      throw new Error("Reply not found");
    }
    
    return this.mapForumReplyFromDB(result.rows[0]);
  }

  async updateForumReply(id: number, replyData: Partial<ForumReply>): Promise<ForumReply | undefined> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (replyData.content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(replyData.content);
    }
    
    if (replyData.upvotes !== undefined) {
      updates.push(`upvotes = $${paramIndex++}`);
      values.push(replyData.upvotes);
    }
    
    if (replyData.isBestAnswer !== undefined) {
      updates.push(`is_best_answer = $${paramIndex++}`);
      values.push(replyData.isBestAnswer);
    }
    
    updates.push(`updated_at = NOW()`);
    
    if (updates.length === 0) return this.getForumReply(id);
    
    values.push(id);
    const queryText = `
      UPDATE forum_replies
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await this.pool.query(queryText, values);
    if (result.rows.length === 0) return undefined;
    return this.mapForumReplyFromDB(result.rows[0]);
  }

  async deleteForumReply(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM forum_replies WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  async markAsBestAnswer(postId: number, replyId: number): Promise<ForumReply> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Reset any existing best answers for this post
      await client.query(
        'UPDATE forum_replies SET is_best_answer = FALSE WHERE post_id = $1 AND is_best_answer = TRUE',
        [postId]
      );
      
      // Mark the new best answer
      const result = await client.query(
        'UPDATE forum_replies SET is_best_answer = TRUE WHERE id = $1 AND post_id = $2 RETURNING *',
        [replyId, postId]
      );
      
      if (result.rows.length === 0) {
        throw new Error("Reply not found or doesn't belong to the specified post");
      }
      
      await client.query('COMMIT');
      return this.mapForumReplyFromDB(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private mapForumReplyFromDB(row: any): ForumReply {
    return {
      id: row.id,
      postId: row.post_id,
      userId: row.user_id,
      content: row.content,
      upvotes: row.upvotes,
      isBestAnswer: row.is_best_answer,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  // Resource operations
  async getAllResources(): Promise<Resource[]> {
    const result = await this.pool.query('SELECT * FROM resources ORDER BY created_at DESC');
    return result.rows.map(row => this.mapResourceFromDB(row));
  }

  async getResource(id: number): Promise<Resource | undefined> {
    const result = await this.pool.query('SELECT * FROM resources WHERE id = $1', [id]);
    if (result.rows.length === 0) return undefined;
    return this.mapResourceFromDB(result.rows[0]);
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const result = await this.pool.query(`
      INSERT INTO resources (title, description, link, content, resource_type, user_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      resource.title,
      resource.description,
      resource.link,
      resource.content,
      resource.resourceType,
      resource.userId
    ]);
    
    return this.mapResourceFromDB(result.rows[0]);
  }

  async updateResource(id: number, resourceData: Partial<Resource>): Promise<Resource | undefined> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (resourceData.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(resourceData.title);
    }
    
    if (resourceData.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(resourceData.description);
    }
    
    if (resourceData.link !== undefined) {
      updates.push(`link = $${paramIndex++}`);
      values.push(resourceData.link);
    }
    
    if (resourceData.content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(resourceData.content);
    }
    
    if (resourceData.resourceType !== undefined) {
      updates.push(`resource_type = $${paramIndex++}`);
      values.push(resourceData.resourceType);
    }
    
    updates.push(`updated_at = NOW()`);
    
    if (updates.length === 0) return this.getResource(id);
    
    values.push(id);
    const queryText = `
      UPDATE resources
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await this.pool.query(queryText, values);
    if (result.rows.length === 0) return undefined;
    return this.mapResourceFromDB(result.rows[0]);
  }

  async deleteResource(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM resources WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  private mapResourceFromDB(row: any): Resource {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      link: row.link,
      content: row.content,
      resourceType: row.resource_type,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}

// Use PostgreSQL storage if DATABASE_URL environment variable is set
// Otherwise, fall back to in-memory storage
export const storage = process.env.DATABASE_URL 
  ? new PostgreSQLStorage() 
  : new MemStorage();
