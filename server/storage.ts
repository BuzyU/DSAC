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
  
  // Event operations
  getAllEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // Event registration operations
  getEventRegistration(eventId: number, userId: number): Promise<EventRegistration | undefined>;
  createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration>;
  
  // Contest result operations
  getContestResults(eventId: number): Promise<ContestResult[]>;
  createContestResult(result: InsertContestResult): Promise<ContestResult>;
  
  // Leaderboard operations
  getLeaderboard(): Promise<any[]>;
  
  // Forum operations
  getAllForumPosts(): Promise<ForumPost[]>;
  getForumPost(id: number): Promise<ForumPost | undefined>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  incrementForumPostViews(id: number): Promise<void>;
  
  // Forum reply operations
  getForumReplies(postId: number): Promise<ForumReply[]>;
  getForumReply(id: number): Promise<ForumReply | undefined>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  upvoteForumReply(id: number): Promise<ForumReply>;
  markAsBestAnswer(postId: number, replyId: number): Promise<ForumReply>;
  
  // Resource operations
  getAllResources(): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  
  // Session store
  sessionStore: session.SessionStore;
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
  
  sessionStore: session.SessionStore;
  
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
    
    this.seedData();
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
      createdAt: now
    };
    this.users.set(id, user);
    return user;
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
  
  // Contest result operations
  async getContestResults(eventId: number): Promise<ContestResult[]> {
    return Array.from(this.contestResults.values())
      .filter((result) => result.eventId === eventId)
      .sort((a, b) => b.score - a.score);
  }
  
  async createContestResult(insertResult: InsertContestResult): Promise<ContestResult> {
    const id = this.contestResultId++;
    const now = new Date();
    const result: ContestResult = { ...insertResult, id, createdAt: now };
    this.contestResults.set(id, result);
    return result;
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
      createdAt: now,
      updatedAt: now
    };
    this.forumPosts.set(id, post);
    return post;
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
      createdAt: now,
      updatedAt: now
    };
    this.resources.set(id, resource);
    return resource;
  }
  
  // Seed data for development
  private seedData() {
    // Create admin user
    const adminId = this.userId++;
    const adminPassword = "$2b$10$X4kv7j5ZcG39WgogSl1Z.edYQTThGZpLJ/zqxK5eTnStY3olD5Wm2"; // "admin123"
    this.users.set(adminId, {
      id: adminId,
      username: "admin",
      password: adminPassword,
      displayName: "Admin",
      email: "admin@dsac.com",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      bio: "Site administrator",
      role: "admin",
      level: "advanced",
      createdAt: new Date("2023-01-01")
    });
    
    // Create some members
    const sophiaId = this.userId++;
    this.users.set(sophiaId, {
      id: sophiaId,
      username: "sophia",
      password: adminPassword, // same password for simplicity
      displayName: "Sophia Chen",
      email: "sophia@dsac.com",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      bio: "Passionate about algorithms",
      role: "member",
      level: "advanced",
      createdAt: new Date("2023-01-02")
    });
    
    const alexId = this.userId++;
    this.users.set(alexId, {
      id: alexId,
      username: "alex",
      password: adminPassword,
      displayName: "Alex Johnson",
      email: "alex@dsac.com",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
      bio: "Software engineer focusing on data structures",
      role: "member",
      level: "advanced",
      createdAt: new Date("2023-01-03")
    });
    
    const rahulId = this.userId++;
    this.users.set(rahulId, {
      id: rahulId,
      username: "rahul",
      password: adminPassword,
      displayName: "Rahul Patel",
      email: "rahul@dsac.com",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      bio: "CS student interested in competitive programming",
      role: "member",
      level: "intermediate",
      createdAt: new Date("2023-01-04")
    });
    
    const jamieId = this.userId++;
    this.users.set(jamieId, {
      id: jamieId,
      username: "jamie",
      password: adminPassword,
      displayName: "Jamie Taylor",
      email: "jamie@dsac.com",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      bio: "Learning DSA for better problem-solving",
      role: "member",
      level: "intermediate",
      createdAt: new Date("2023-01-05")
    });
    
    const mayaId = this.userId++;
    this.users.set(mayaId, {
      id: mayaId,
      username: "maya",
      password: adminPassword,
      displayName: "Maya Williams",
      email: "maya@dsac.com",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      bio: "Graph algorithms specialist",
      role: "member",
      level: "advanced",
      createdAt: new Date("2023-01-06")
    });
    
    // Create some events
    const eventDate1 = new Date();
    eventDate1.setDate(eventDate1.getDate() + 7); // One week from now
    
    const event1Id = this.eventId++;
    this.events.set(event1Id, {
      id: event1Id,
      title: "Weekly DSA Contest",
      description: "Join our weekly contest focusing on graph algorithms and dynamic programming challenges.",
      eventType: "contest",
      date: eventDate1,
      duration: 150, // 2.5 hours
      location: "Virtual",
      createdBy: adminId,
      createdAt: new Date("2023-09-15")
    });
    
    const eventDate2 = new Date();
    eventDate2.setDate(eventDate2.getDate() + 9);
    
    const event2Id = this.eventId++;
    this.events.set(event2Id, {
      id: event2Id,
      title: "Google Interview Prep",
      description: "Workshop with a Google engineer on interview strategies and common technical questions.",
      eventType: "workshop",
      date: eventDate2,
      duration: 90, // 1.5 hours
      location: "CS Building, Room 103",
      createdBy: adminId,
      createdAt: new Date("2023-09-16")
    });
    
    const eventDate3 = new Date();
    eventDate3.setDate(eventDate3.getDate() + 12);
    
    const event3Id = this.eventId++;
    this.events.set(event3Id, {
      id: event3Id,
      title: "Beginner's DSA Workshop",
      description: "Introduction to fundamental data structures and algorithms for beginners. Perfect for first-year students.",
      eventType: "workshop",
      date: eventDate3,
      duration: 120, // 2 hours
      location: "Library Study Room",
      createdBy: sophiaId,
      createdAt: new Date("2023-09-17")
    });
    
    // Create past events for contest results
    const pastEvent1 = this.eventId++;
    const pastEventDate1 = new Date();
    pastEventDate1.setDate(pastEventDate1.getDate() - 14);
    
    this.events.set(pastEvent1, {
      id: pastEvent1,
      title: "Monthly Algorithm Challenge",
      description: "Solve challenging algorithm problems in this monthly competition.",
      eventType: "contest",
      date: pastEventDate1,
      duration: 180, // 3 hours
      location: "Virtual",
      createdBy: adminId,
      createdAt: new Date("2023-09-01")
    });
    
    // Add some contest results
    const result1Id = this.contestResultId++;
    this.contestResults.set(result1Id, {
      id: result1Id,
      eventId: pastEvent1,
      userId: sophiaId,
      position: 1,
      score: 1245,
      createdAt: new Date("2023-09-15")
    });
    
    const result2Id = this.contestResultId++;
    this.contestResults.set(result2Id, {
      id: result2Id,
      eventId: pastEvent1,
      userId: alexId,
      position: 2,
      score: 1102,
      createdAt: new Date("2023-09-15")
    });
    
    const result3Id = this.contestResultId++;
    this.contestResults.set(result3Id, {
      id: result3Id,
      eventId: pastEvent1,
      userId: rahulId,
      position: 3,
      score: 986,
      createdAt: new Date("2023-09-15")
    });
    
    const result4Id = this.contestResultId++;
    this.contestResults.set(result4Id, {
      id: result4Id,
      eventId: pastEvent1,
      userId: jamieId,
      position: 4,
      score: 845,
      createdAt: new Date("2023-09-15")
    });
    
    // Create forum posts
    const post1Id = this.forumPostId++;
    this.forumPosts.set(post1Id, {
      id: post1Id,
      title: "Optimizing Dynamic Programming Solutions",
      content: "I'm working on some DP problems from LeetCode and noticed my solutions are correct but time out on larger inputs. Any tips for optimizing DP approaches? I'm specifically struggling with state compression and memoization techniques.",
      userId: rahulId,
      views: 241,
      createdAt: new Date("2023-10-05"),
      updatedAt: new Date("2023-10-05"),
      tags: ["dynamic-programming", "optimization", "leetcode"]
    });
    
    const post2Id = this.forumPostId++;
    this.forumPosts.set(post2Id, {
      id: post2Id,
      title: "Most Efficient Graph Traversal for Social Networks",
      content: "For my project, I need to analyze friendship connections in a social network. What's the most efficient algorithm for finding degrees of separation between two users? BFS seems straightforward but I'm wondering if there are more optimized approaches for large datasets.",
      userId: mayaId,
      views: 176,
      createdAt: new Date("2023-10-04"),
      updatedAt: new Date("2023-10-04"),
      tags: ["graphs", "bfs", "social-networks"]
    });
    
    // Add some forum replies
    const reply1Id = this.forumReplyId++;
    this.forumReplies.set(reply1Id, {
      id: reply1Id,
      postId: post1Id,
      content: "For DP problems, I've found that using an iterative approach instead of recursive with memoization often reduces the overhead. Also, try to minimize your state representation - sometimes you don't need to keep track of as much as you think.",
      userId: sophiaId,
      upvotes: 5,
      isBestAnswer: true,
      createdAt: new Date("2023-10-05T02:30:00"),
      updatedAt: new Date("2023-10-05T02:30:00")
    });
    
    const reply2Id = this.forumReplyId++;
    this.forumReplies.set(reply2Id, {
      id: reply2Id,
      postId: post1Id,
      content: "One thing that helped me was to draw out the state transitions and really understand the recurrence relation. Sometimes you can optimize by combining states or eliminating unnecessary calculations.",
      userId: alexId,
      upvotes: 3,
      isBestAnswer: false,
      createdAt: new Date("2023-10-05T03:15:00"),
      updatedAt: new Date("2023-10-05T03:15:00")
    });
    
    const reply3Id = this.forumReplyId++;
    this.forumReplies.set(reply3Id, {
      id: reply3Id,
      postId: post2Id,
      content: "For social networks, BFS is indeed a good approach for finding shortest paths (degrees of separation). For very large graphs, you might want to look into bidirectional BFS which runs the search from both ends simultaneously.",
      userId: sophiaId,
      upvotes: 4,
      isBestAnswer: true,
      createdAt: new Date("2023-10-04T14:20:00"),
      updatedAt: new Date("2023-10-04T14:20:00")
    });
    
    // Add resources
    const resource1Id = this.resourceId++;
    this.resources.set(resource1Id, {
      id: resource1Id,
      title: "DSA Fundamentals",
      description: "Comprehensive guide to basic data structures and algorithms for beginners.",
      content: "This guide covers the fundamental data structures and algorithms every programmer should know, from arrays and linked lists to sorting and searching algorithms.",
      resourceType: "guide",
      link: "#",
      userId: adminId,
      createdAt: new Date("2023-08-15"),
      updatedAt: new Date("2023-08-15")
    });
    
    const resource2Id = this.resourceId++;
    this.resources.set(resource2Id, {
      id: resource2Id,
      title: "Video Tutorials",
      description: "Step-by-step video explanations of common algorithm patterns and techniques.",
      content: "This series of video tutorials walks through common algorithm patterns with visualizations and code examples.",
      resourceType: "video",
      link: "#",
      userId: sophiaId,
      createdAt: new Date("2023-08-20"),
      updatedAt: new Date("2023-08-20")
    });
    
    const resource3Id = this.resourceId++;
    this.resources.set(resource3Id, {
      id: resource3Id,
      title: "Problem Sets",
      description: "Curated collection of DSA problems organized by difficulty and topic.",
      content: "Practice makes perfect! This collection of problems is organized by topic and difficulty to help you build your skills progressively.",
      resourceType: "practice",
      link: "#",
      userId: alexId,
      createdAt: new Date("2023-08-25"),
      updatedAt: new Date("2023-08-25")
    });
    
    const resource4Id = this.resourceId++;
    this.resources.set(resource4Id, {
      id: resource4Id,
      title: "Interview Prep",
      description: "Comprehensive guide to technical interviews with mock questions and strategies.",
      content: "Prepare for your technical interviews with this comprehensive guide that includes common questions, strategies, and tips from industry professionals.",
      resourceType: "career",
      link: "#",
      userId: mayaId,
      createdAt: new Date("2023-08-30"),
      updatedAt: new Date("2023-08-30")
    });
  }
}

export const storage = new MemStorage();
