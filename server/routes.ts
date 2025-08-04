import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, type TicketFilters } from "./storage";
import { insertTicketSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Upload CSV and process tickets
  app.post("/api/tickets/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      if (!req.file.originalname.toLowerCase().endsWith('.csv')) {
        return res.status(400).json({ message: "File must be a CSV" });
      }

      const csvData = req.file.buffer.toString('utf-8');
      const tickets = await parseCSVToTickets(csvData);
      
      // Clear existing tickets and add new ones
      await storage.deleteAllTickets();
      const savedTickets = await storage.createTickets(tickets);
      
      // Calculate and save analytics
      const analyticsResult = await calculateAnalytics(savedTickets);
      const analytics = {
        totalTickets: analyticsResult.totalTickets,
        slaCompliance: analyticsResult.slaCompliance.toString(),
        overdueTickets: analyticsResult.overdueTickets,
        avgResolutionTime: analyticsResult.avgResolutionTime.toString()
      };
      await storage.saveAnalytics(analytics);

      res.json({ 
        message: "Tickets uploaded successfully", 
        count: savedTickets.length 
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to process CSV file" });
    }
  });

  // Get tickets with optional filters
  app.get("/api/tickets", async (req, res) => {
    try {
      const filters: TicketFilters = {};
      
      if (req.query.technician) filters.technician = req.query.technician as string;
      if (req.query.category) filters.category = req.query.category as string;
      if (req.query.priority) filters.priority = req.query.priority as string;
      if (req.query.status) filters.status = req.query.status as string;
      
      if (req.query.dateRange) {
        const range = JSON.parse(req.query.dateRange as string);
        filters.dateRange = {
          start: new Date(range.start),
          end: new Date(range.end)
        };
      }

      const tickets = await storage.getTickets(filters);
      res.json(tickets);
    } catch (error) {
      console.error("Get tickets error:", error);
      res.status(500).json({ message: "Failed to retrieve tickets" });
    }
  });

  // Get analytics
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getLatestAnalytics();
      if (!analytics) {
        return res.status(404).json({ message: "No analytics data available" });
      }
      res.json(analytics);
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({ message: "Failed to retrieve analytics" });
    }
  });

  // Get dashboard data (combined analytics + recent tickets)
  app.get("/api/dashboard", async (req, res) => {
    try {
      const [analytics, recentTickets] = await Promise.all([
        storage.getLatestAnalytics(),
        storage.getTickets()
      ]);

      if (!analytics || recentTickets.length === 0) {
        return res.json({
          analytics: null,
          recentTickets: [],
          message: "No data available. Please upload a CSV file."
        });
      }

      // Calculate additional metrics
      const totalTickets = recentTickets.length;
      const overdueTickets = recentTickets.filter(t => t.isOverdue).length;
      const closedTickets = recentTickets.filter(t => 
        t.status?.toLowerCase().includes('cerrada') || 
        t.status?.toLowerCase().includes('closed')
      ).length;
      
      // Calculate SLA compliance
      const ticketsWithSLA = recentTickets.filter(t => t.dueByDate);
      const onTimeTickets = ticketsWithSLA.filter(t => {
        if (!t.completedDate || !t.dueByDate) return false;
        return new Date(t.completedDate) <= new Date(t.dueByDate);
      }).length;
      
      const slaCompliance = ticketsWithSLA.length > 0 
        ? (onTimeTickets / ticketsWithSLA.length) * 100 
        : 0;

      // Group by technician for performance data
      const technicianStats = calculateTechnicianStats(recentTickets);
      
      // Group by category
      const categoryStats = calculateCategoryStats(recentTickets);
      
      // Group by priority
      const priorityStats = calculatePriorityStats(recentTickets);
      
      // Group by status
      const statusStats = calculateStatusStats(recentTickets);

      res.json({
        analytics: {
          totalTickets,
          slaCompliance: parseFloat(slaCompliance.toFixed(1)),
          overdueTickets,
          closedTickets,
          avgResolutionTime: calculateAvgResolutionTime(recentTickets) || 0
        },
        technicianStats,
        categoryStats,
        priorityStats,
        statusStats,
        recentTickets: recentTickets.slice(0, 10) // Return only 10 most recent
      });
    } catch (error) {
      console.error("Get dashboard error:", error);
      res.status(500).json({ message: "Failed to retrieve dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions
async function parseCSVToTickets(csvData: string) {
  const lines = csvData.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const tickets = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length < headers.length) continue;

    const ticketData: any = {};
    headers.forEach((header, index) => {
      const value = values[index]?.replace(/"/g, '').trim();
      
      switch (header) {
        case 'Request ID':
          ticketData.requestId = value;
          break;
        case 'Subject':
          ticketData.subject = value;
          break;
        case 'Requester Name':
          ticketData.requesterName = value;
          break;
        case 'Created Date':
          ticketData.createdDate = value ? new Date(value) : null;
          break;
        case 'Description':
          ticketData.description = value;
          break;
        case 'Technician':
          ticketData.technician = value;
          break;
        case 'Status':
          ticketData.status = value;
          break;
        case 'Due by date':
          ticketData.dueByDate = value ? new Date(value) : null;
          break;
        case 'Responded Date':
          ticketData.respondedDate = value ? new Date(value) : null;
          break;
        case 'Completed Date':
          ticketData.completedDate = value ? new Date(value) : null;
          break;
        case 'Resolved Time':
          ticketData.resolvedTime = value;
          break;
        case 'Category':
          ticketData.category = value;
          break;
        case 'Sub Category':
          ticketData.subCategory = value;
          break;
        case 'Priority':
          ticketData.priority = value;
          break;
        case 'Urgency':
          ticketData.urgency = value;
          break;
        case 'Impact':
          ticketData.impact = value;
          break;
        case 'Request Type':
          ticketData.requestType = value;
          break;
        case 'Department':
          ticketData.department = value;
          break;
        case 'Is Overdue':
          ticketData.isOverdue = value?.toLowerCase() === 'true';
          break;
        case 'Is Response Overdue':
          ticketData.isResponseOverdue = value?.toLowerCase() === 'true';
          break;
        case 'Resolution':
          ticketData.resolution = value;
          break;
        case 'Resolution Time':
          ticketData.resolutionTime = value;
          break;
      }
    });

    // Clean data and validate
    if (ticketData.requestId && 
        ticketData.subject && 
        ticketData.requesterName &&
        ticketData.status &&
        ticketData.technician &&
        !ticketData.status.includes('<') &&
        !ticketData.technician.includes('<') &&
        ticketData.status.length < 100 &&
        ticketData.technician.length < 100) {
      
      // Clean HTML content from critical fields
      ticketData.subject = cleanHTMLContent(ticketData.subject);
      ticketData.status = cleanHTMLContent(ticketData.status);
      ticketData.technician = cleanHTMLContent(ticketData.technician);
      ticketData.category = cleanHTMLContent(ticketData.category);
      ticketData.priority = cleanHTMLContent(ticketData.priority);
      ticketData.description = cleanHTMLContent(ticketData.description).substring(0, 500);
      
      tickets.push(ticketData);
    }
  }

  return tickets;
}

function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function cleanHTMLContent(text: string): string {
  if (!text) return '';
  
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, '');
  
  // Remove HTML entities
  text = text.replace(/&[a-zA-Z0-9#]+;/g, '');
  
  // Remove extra whitespace and special characters
  text = text.replace(/\s+/g, ' ').trim();
  
  // Remove URLs and file paths
  text = text.replace(/https?:\/\/[^\s]+/g, '');
  text = text.replace(/\/app\/[^\s]+/g, '');
  
  // Remove style attributes and other noise
  text = text.replace(/style="[^"]*"/g, '');
  text = text.replace(/class="[^"]*"/g, '');
  
  return text;
}

async function calculateAnalytics(tickets: any[]) {
  const totalTickets = tickets.length;
  const overdueTickets = tickets.filter(t => t.isOverdue).length;
  const closedTickets = tickets.filter(t => 
    t.status && (
      t.status.toLowerCase().includes('cerrada') ||
      t.status.toLowerCase().includes('cerrado') ||
      t.status.toLowerCase().includes('completado') ||
      t.status.toLowerCase().includes('resuelto') ||
      t.status.toLowerCase().includes('closed') ||
      t.status.toLowerCase().includes('resolved')
    )
  ).length;
  
  // Calculate SLA compliance based on priority and completion times
  const slaCompliantTickets = tickets.filter(ticket => {
    if (!ticket.createdDate || !ticket.completedDate || !ticket.priority) {
      return false;
    }
    
    const created = new Date(ticket.createdDate);
    const completed = new Date(ticket.completedDate);
    const hoursDiff = (completed.getTime() - created.getTime()) / (1000 * 60 * 60);
    
    // SLA targets based on priority (from Excel)
    const slaTargets: Record<string, number> = {
      'Crítica': 8.5,   // 0.5 days in hours
      'Alta': 12.5,     // 0.5 days in hours  
      'Media': 72,      // 3 days in hours
      'Baja': 120,      // 5 days in hours
      'Normal': 72      // 3 days in hours
    };
    
    const target = slaTargets[ticket.priority] || 72; // Default to 3 days
    return hoursDiff <= target;
  });
  
  const slaCompliance = totalTickets > 0 
    ? (slaCompliantTickets.length / totalTickets) * 100 
    : 0;

  const avgResolutionTime = calculateAvgResolutionTime(tickets);

  return {
    totalTickets,
    slaCompliance: parseFloat(slaCompliance.toFixed(1)),
    overdueTickets,
    closedTickets,
    avgResolutionTime
  };
}

function calculateAvgResolutionTime(tickets: any[]): number {
  const completedTickets = tickets.filter(t => t.createdDate && t.completedDate);
  if (completedTickets.length === 0) return 0;

  try {
    const totalTime = completedTickets.reduce((sum, ticket) => {
      const created = new Date(ticket.createdDate).getTime();
      const completed = new Date(ticket.completedDate).getTime();
      if (isNaN(created) || isNaN(completed)) return sum;
      return sum + (completed - created);
    }, 0);

    if (totalTime === 0) return 0;

    // Return average time in days
    const avgDays = totalTime / completedTickets.length / (1000 * 60 * 60 * 24);
    return parseFloat(avgDays.toFixed(2)) || 0;
  } catch (error) {
    console.error('Error calculating average resolution time:', error);
    return 0;
  }
}

function calculateTechnicianStats(tickets: any[]) {
  const stats: any = {};
  
  tickets.forEach(ticket => {
    if (!ticket.technician) return;
    
    if (!stats[ticket.technician]) {
      stats[ticket.technician] = {
        name: ticket.technician,
        totalTickets: 0,
        onTimeTickets: 0,
        overdueTickets: 0,
        slaCompliance: 0
      };
    }
    
    stats[ticket.technician].totalTickets++;
    
    if (ticket.isOverdue) {
      stats[ticket.technician].overdueTickets++;
    } else if (ticket.dueByDate && ticket.completedDate) {
      if (new Date(ticket.completedDate) <= new Date(ticket.dueByDate)) {
        stats[ticket.technician].onTimeTickets++;
      }
    }
  });
  
  // Calculate SLA compliance percentage
  Object.values(stats).forEach((stat: any) => {
    const totalWithSLA = stat.onTimeTickets + stat.overdueTickets;
    stat.slaCompliance = totalWithSLA > 0 
      ? parseFloat(((stat.onTimeTickets / totalWithSLA) * 100).toFixed(1))
      : 0;
  });
  
  return Object.values(stats);
}

function calculateCategoryStats(tickets: any[]) {
  const stats: any = {};
  
  tickets.forEach(ticket => {
    const category = ticket.category || 'Sin categoría';
    stats[category] = (stats[category] || 0) + 1;
  });
  
  return Object.entries(stats).map(([name, count]) => ({ name, count }));
}

function calculatePriorityStats(tickets: any[]) {
  const stats: any = {};
  
  tickets.forEach(ticket => {
    const priority = ticket.priority || 'Sin prioridad';
    stats[priority] = (stats[priority] || 0) + 1;
  });
  
  return Object.entries(stats).map(([name, count]) => ({ name, count }));
}

function calculateStatusStats(tickets: any[]) {
  const stats: any = {};
  
  tickets.forEach(ticket => {
    const status = ticket.status || 'Sin estado';
    stats[status] = (stats[status] || 0) + 1;
  });
  
  return Object.entries(stats).map(([name, count]) => ({ name, count }));
}
