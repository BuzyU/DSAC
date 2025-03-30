import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertEventSchema, 
  insertEventRegistrationSchema, 
  insertContestResultSchema,
  insertForumPostSchema,
  insertForumReplySchema,
  insertResourceSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Events Routes
  app.get("/api/events", async (req, res) => {
    const events = await storage.getAllEvents();
    res.json(events);
  });

  app.get("/api/events/:id", async (req, res) => {
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    res.json(event);
  });

  app.post("/api/events", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const eventData = insertEventSchema.parse(req.body);
      const newEvent = await storage.createEvent({
        ...eventData,
        createdBy: req.user.id
      });
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // Event Registrations
  app.post("/api/events/:id/register", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    try {
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const existingRegistration = await storage.getEventRegistration(eventId, req.user.id);
      if (existingRegistration) {
        return res.status(400).json({ message: "Already registered for this event" });
      }

      const registration = await storage.createEventRegistration({
        eventId,
        userId: req.user.id
      });

      res.status(201).json(registration);
    } catch (error) {
      res.status(500).json({ message: "Failed to register for event" });
    }
  });

  // Contest Results
  app.post("/api/events/:id/results", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    try {
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const resultData = insertContestResultSchema.parse(req.body);
      const result = await storage.createContestResult({
        ...resultData,
        eventId
      });

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create contest result" });
    }
  });

  // Leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Forum Posts
  app.get("/api/forum", async (req, res) => {
    try {
      const posts = await storage.getAllForumPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forum posts" });
    }
  });

  app.get("/api/forum/:id", async (req, res) => {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    try {
      const post = await storage.getForumPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Increment view count
      await storage.incrementForumPostViews(postId);
      
      // Get replies for this post
      const replies = await storage.getForumReplies(postId);
      
      res.json({
        ...post,
        replies
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forum post" });
    }
  });

  app.post("/api/forum", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const postData = insertForumPostSchema.parse(req.body);
      const newPost = await storage.createForumPost({
        ...postData,
        userId: req.user.id
      });
      res.status(201).json(newPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create forum post" });
    }
  });

  // Forum Replies
  app.post("/api/forum/:id/reply", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    try {
      const post = await storage.getForumPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const replyData = insertForumReplySchema.parse(req.body);
      const newReply = await storage.createForumReply({
        ...replyData,
        postId,
        userId: req.user.id
      });
      res.status(201).json(newReply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create reply" });
    }
  });

  // Upvote a reply
  app.post("/api/forum/reply/:id/upvote", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const replyId = parseInt(req.params.id);
    if (isNaN(replyId)) {
      return res.status(400).json({ message: "Invalid reply ID" });
    }

    try {
      const reply = await storage.getForumReply(replyId);
      if (!reply) {
        return res.status(404).json({ message: "Reply not found" });
      }

      const updatedReply = await storage.upvoteForumReply(replyId);
      res.json(updatedReply);
    } catch (error) {
      res.status(500).json({ message: "Failed to upvote reply" });
    }
  });

  // Mark reply as best answer
  app.post("/api/forum/reply/:id/best-answer", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const replyId = parseInt(req.params.id);
    if (isNaN(replyId)) {
      return res.status(400).json({ message: "Invalid reply ID" });
    }

    try {
      const reply = await storage.getForumReply(replyId);
      if (!reply) {
        return res.status(404).json({ message: "Reply not found" });
      }

      const post = await storage.getForumPost(reply.postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Check if the user is the post author
      if (post.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Only the post author can mark a best answer" });
      }

      const updatedReply = await storage.markAsBestAnswer(reply.postId, replyId);
      res.json(updatedReply);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark as best answer" });
    }
  });

  // Resources
  app.get("/api/resources", async (req, res) => {
    try {
      const resources = await storage.getAllResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  app.get("/api/resources/:id", async (req, res) => {
    const resourceId = parseInt(req.params.id);
    if (isNaN(resourceId)) {
      return res.status(400).json({ message: "Invalid resource ID" });
    }

    try {
      const resource = await storage.getResource(resourceId);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      res.json(resource);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resource" });
    }
  });

  app.post("/api/resources", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const resourceData = insertResourceSchema.parse(req.body);
      const newResource = await storage.createResource({
        ...resourceData,
        userId: req.user.id
      });
      res.status(201).json(newResource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create resource" });
    }
  });

  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove password from each user
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get all forum replies
  app.get("/api/forum/replies", async (req, res) => {
    try {
      const allReplies = [];
      const posts = await storage.getAllForumPosts();
      
      for (const post of posts) {
        const replies = await storage.getForumReplies(post.id);
        allReplies.push(...replies);
      }
      
      res.json(allReplies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forum replies" });
    }
  });

  // User profile
  app.get("/api/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't send password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
