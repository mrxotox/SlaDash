import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: text("request_id").notNull().unique(),
  subject: text("subject").notNull(),
  requesterName: text("requester_name").notNull(),
  createdDate: timestamp("created_date").notNull(),
  description: text("description"),
  technician: text("technician"),
  status: text("status").notNull(),
  dueByDate: timestamp("due_by_date"),
  respondedDate: timestamp("responded_date"),
  completedDate: timestamp("completed_date"),
  resolvedTime: text("resolved_time"),
  category: text("category"),
  subCategory: text("sub_category"),
  priority: text("priority"),
  urgency: text("urgency"),
  impact: text("impact"),
  requestType: text("request_type"),
  department: text("department"),
  isOverdue: boolean("is_overdue").default(false),
  isResponseOverdue: boolean("is_response_overdue").default(false),
  resolution: text("resolution"),
  resolutionTime: text("resolution_time"),
});

export const ticketAnalytics = pgTable("ticket_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  totalTickets: integer("total_tickets").notNull(),
  slaCompliance: text("sla_compliance").notNull(),
  overdueTickets: integer("overdue_tickets").notNull(),
  avgResolutionTime: text("avg_resolution_time").notNull(),
  calculatedAt: timestamp("calculated_at").notNull().default(sql`now()`),
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
});

export const insertAnalyticsSchema = createInsertSchema(ticketAnalytics).omit({
  id: true,
  calculatedAt: true,
});

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicketAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type TicketAnalytics = typeof ticketAnalytics.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
