import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull().unique(),
  avatar: text("avatar"),
  bio: text("bio"),
  role: text("role").default("member").notNull(), // admin, member, guest
  level: text("level").default("beginner").notNull(), // beginner, intermediate, advanced
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  avatar: true,
  bio: true,
});

// Events schema
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  eventType: text("event_type").notNull(), // contest, workshop, meetup
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  location: text("location").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  eventType: true,
  date: true,
  duration: true,
  location: true,
  createdBy: true,
});

// Event registrations schema
export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).pick({
  eventId: true,
  userId: true,
});

// Contest results schema
export const contestResults = pgTable("contest_results", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  position: integer("position"), // 1st, 2nd, 3rd, null for participation only
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContestResultSchema = createInsertSchema(contestResults).pick({
  eventId: true,
  userId: true,
  position: true,
  score: true,
});

// Discussion forum posts schema
export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull(),
  views: integer("views").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  tags: text("tags").array(),
});

export const insertForumPostSchema = createInsertSchema(forumPosts).pick({
  title: true,
  content: true,
  userId: true,
  tags: true,
});

// Forum replies schema
export const forumReplies = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull(),
  upvotes: integer("upvotes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isBestAnswer: boolean("is_best_answer").default(false).notNull(),
});

export const insertForumReplySchema = createInsertSchema(forumReplies).pick({
  postId: true,
  content: true,
  userId: true,
});

// Blog/resources schema
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content"),
  resourceType: text("resource_type").notNull(), // guide, video, practice, career
  link: text("link"),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertResourceSchema = createInsertSchema(resources).pick({
  title: true,
  description: true,
  content: true,
  resourceType: true,
  link: true,
  userId: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;

export type ContestResult = typeof contestResults.$inferSelect;
export type InsertContestResult = z.infer<typeof insertContestResultSchema>;

export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;

export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
