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

const MemoryStore = createMemoryStore(session);

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

export const storage = new MemStorage();
