import { type Ticket, type InsertTicket, type TicketAnalytics, type InsertTicketAnalytics, type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Ticket methods
  createTickets(tickets: InsertTicket[]): Promise<Ticket[]>;
  getTickets(filters?: TicketFilters): Promise<Ticket[]>;
  getTicketById(id: string): Promise<Ticket | undefined>;
  deleteAllTickets(): Promise<void>;
  
  // Analytics methods
  saveAnalytics(analytics: InsertTicketAnalytics): Promise<TicketAnalytics>;
  getLatestAnalytics(): Promise<TicketAnalytics | undefined>;
}

export interface TicketFilters {
  technician?: string;
  category?: string;
  priority?: string;
  status?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tickets: Map<string, Ticket>;
  private analytics: TicketAnalytics | undefined;

  constructor() {
    this.users = new Map();
    this.tickets = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createTickets(insertTickets: InsertTicket[]): Promise<Ticket[]> {
    const tickets: Ticket[] = [];
    
    for (const insertTicket of insertTickets) {
      const id = randomUUID();
      const ticket: Ticket = { ...insertTicket, id };
      this.tickets.set(id, ticket);
      tickets.push(ticket);
    }
    
    return tickets;
  }

  async getTickets(filters?: TicketFilters): Promise<Ticket[]> {
    let tickets = Array.from(this.tickets.values());

    if (filters) {
      if (filters.technician) {
        tickets = tickets.filter(t => t.technician?.toLowerCase().includes(filters.technician!.toLowerCase()));
      }
      if (filters.category) {
        tickets = tickets.filter(t => t.category?.toLowerCase().includes(filters.category!.toLowerCase()));
      }
      if (filters.priority) {
        tickets = tickets.filter(t => t.priority?.toLowerCase() === filters.priority!.toLowerCase());
      }
      if (filters.status) {
        tickets = tickets.filter(t => t.status?.toLowerCase().includes(filters.status!.toLowerCase()));
      }
      if (filters.dateRange) {
        tickets = tickets.filter(t => {
          if (!t.createdDate) return false;
          const createdDate = new Date(t.createdDate);
          return createdDate >= filters.dateRange!.start && createdDate <= filters.dateRange!.end;
        });
      }
    }

    return tickets.sort((a, b) => {
      const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
      const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
      return dateB - dateA; // Most recent first
    });
  }

  async getTicketById(id: string): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async deleteAllTickets(): Promise<void> {
    this.tickets.clear();
  }

  async saveAnalytics(insertAnalytics: InsertTicketAnalytics): Promise<TicketAnalytics> {
    const id = randomUUID();
    const analytics: TicketAnalytics = {
      ...insertAnalytics,
      id,
      calculatedAt: new Date(),
    };
    this.analytics = analytics;
    return analytics;
  }

  async getLatestAnalytics(): Promise<TicketAnalytics | undefined> {
    return this.analytics;
  }
}

export const storage = new MemStorage();
