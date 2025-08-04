import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, type TicketFilters } from "./storage";
import { insertTicketSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import * as XLSX from 'xlsx';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Upload Excel/CSV and process tickets
  app.post("/api/tickets/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const filename = req.file.originalname.toLowerCase();
      let tickets: any[] = [];

      if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
        // Process Excel file
        tickets = await parseExcelToTickets(req.file.buffer);
      } else if (filename.endsWith('.csv')) {
        // Process CSV file (legacy support)
        const csvData = req.file.buffer.toString('utf-8');
        tickets = await parseCSVToTickets(csvData);
      } else {
        return res.status(400).json({ message: "File must be an Excel (.xlsx/.xls) or CSV file" });
      }
      
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
      res.status(500).json({ message: "Failed to process file" });
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

  // Get dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      const tickets = await storage.getTickets();
      const analytics = await storage.getAnalytics();
      
      if (!tickets.length) {
        return res.json({
          analytics: null,
          recentTickets: [],
          statusStats: [],
          categoryStats: [],
          priorityStats: [],
          technicianStats: [],
          message: "No tickets available. Please upload a file to start analyzing your data."
        });
      }

      // Calculate real-time statistics
      const statusStats = calculateStatusStats(tickets);
      const categoryStats = calculateCategoryStats(tickets);
      const priorityStats = calculatePriorityStats(tickets);
      const technicianStats = calculateTechnicianStats(tickets);
      
      // Get recent tickets (last 20)
      const recentTickets = tickets
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20);

      res.json({
        analytics: analytics ? {
          totalTickets: parseInt(analytics.totalTickets),
          slaCompliance: parseFloat(analytics.slaCompliance),
          overdueTickets: parseInt(analytics.overdueTickets),
          avgResolutionTime: parseFloat(analytics.avgResolutionTime),
          closedTickets: tickets.filter(t => t.status === 'Cerrado' || t.status === 'Closed').length
        } : null,
        recentTickets,
        statusStats,
        categoryStats,
        priorityStats,
        technicianStats
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ message: "Failed to load dashboard data" });
    }
  });

  // Export SLA report
  app.get("/api/export/sla", async (req, res) => {
    try {
      const tickets = await storage.getTickets();
      
      // Generate SLA report data
      const slaReport = tickets.map(ticket => ({
        ticketId: ticket.ticketId,
        title: ticket.title,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt,
        resolvedAt: ticket.resolvedAt,
        technician: ticket.technician,
        slaTarget: getSLATarget(ticket.priority, ticket.category),
        slaCompliant: calculateSLACompliance(ticket)
      }));

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=sla-report.json');
      res.json(slaReport);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ message: "Failed to export SLA report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Excel parsing function
async function parseExcelToTickets(buffer: Buffer) {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    if (!rawData.length || rawData.length < 2) {
      throw new Error('Excel file appears to be empty or has no data rows');
    }

    // Find header row and column mappings
    const headers = rawData[0] as string[];
    const columnMap = mapExcelColumns(headers);
    
    const tickets = [];
    
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue;
      
      try {
        const ticketData = {
          requestId: sanitizeValue(row[columnMap.requestId])?.toString() || `REQ-${Date.now()}-${i}`,
          subject: sanitizeValue(row[columnMap.subject])?.toString() || 'No Subject',
          requesterName: sanitizeValue(row[columnMap.requesterName])?.toString() || 'Unknown',
          createdDate: parseExcelDate(row[columnMap.createdDate]) || new Date().toISOString(),
          description: sanitizeValue(row[columnMap.description])?.toString() || '',
          technician: normalizeTechnician(sanitizeValue(row[columnMap.technician])?.toString() || 'No asignado'),
          status: normalizeStatus(sanitizeValue(row[columnMap.status])?.toString() || 'Abierto'),
          dueByDate: parseExcelDate(row[columnMap.dueByDate]) || null,
          respondedDate: parseExcelDate(row[columnMap.respondedDate]) || null,
          completedDate: parseExcelDate(row[columnMap.completedDate]) || null,
          resolvedTime: sanitizeValue(row[columnMap.resolvedTime])?.toString() || null,
          category: normalizeCategory(sanitizeValue(row[columnMap.category])?.toString() || 'General'),
          subCategory: sanitizeValue(row[columnMap.subCategory])?.toString() || null,
          priority: normalizePriority(sanitizeValue(row[columnMap.priority])?.toString() || 'Media'),
          urgency: sanitizeValue(row[columnMap.urgency])?.toString() || null,
          impact: sanitizeValue(row[columnMap.impact])?.toString() || null,
          requestType: sanitizeValue(row[columnMap.requestType])?.toString() || null,
          department: sanitizeValue(row[columnMap.department])?.toString() || null,
          isOverdue: parseBoolean(row[columnMap.isOverdue]) || false,
          isResponseOverdue: parseBoolean(row[columnMap.isResponseOverdue]) || false,
          resolution: sanitizeValue(row[columnMap.resolution])?.toString() || null,
          resolutionTime: sanitizeValue(row[columnMap.resolutionTime])?.toString() || null,
        };
        
        // Validate the ticket data
        const validatedTicket = insertTicketSchema.parse(ticketData);
        tickets.push(validatedTicket);
      } catch (error) {
        console.warn(`Skipping invalid row ${i + 1}:`, error);
        continue;
      }
    }
    
    console.log(`Successfully parsed ${tickets.length} tickets from Excel file`);
    return tickets;
  } catch (error) {
    console.error('Excel parsing error:', error);
    throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Map Excel columns based on common header patterns
function mapExcelColumns(headers: string[]) {
  const map: { [key: string]: number } = {};
  
  headers.forEach((header, index) => {
    const normalized = header?.toString().toLowerCase().trim() || '';
    
    // Request ID patterns
    if (['request id', 'requestid', 'request_id', 'id', 'ticket id', 'ticketid', 'número', 'numero'].includes(normalized)) {
      map.requestId = index;
    }
    // Subject patterns
    else if (['subject', 'asunto', 'title', 'titulo', 'título', 'summary', 'resumen'].includes(normalized)) {
      map.subject = index;
    }
    // Requester name patterns
    else if (['requester name', 'requestername', 'requester_name', 'solicitante', 'nombre'].includes(normalized)) {
      map.requesterName = index;
    }
    // Created date patterns
    else if (['created date', 'createddate', 'created_date', 'fecha creacion', 'fecha_creacion'].includes(normalized)) {
      map.createdDate = index;
    }
    // Description patterns
    else if (['description', 'descripcion', 'descripción', 'details', 'detalles', 'content'].includes(normalized)) {
      map.description = index;
    }
    // Technician patterns
    else if (['technician', 'tecnico', 'técnico', 'assigned', 'asignado', 'agent', 'agente'].includes(normalized)) {
      map.technician = index;
    }
    // Status patterns
    else if (['status', 'estado', 'state', 'condition'].includes(normalized)) {
      map.status = index;
    }
    // Due by date patterns
    else if (['due by date', 'duebydate', 'due_by_date', 'fecha vencimiento', 'fecha_vencimiento'].includes(normalized)) {
      map.dueByDate = index;
    }
    // Responded date patterns
    else if (['responded date', 'respondeddate', 'responded_date', 'fecha respuesta', 'fecha_respuesta'].includes(normalized)) {
      map.respondedDate = index;
    }
    // Completed date patterns
    else if (['completed date', 'completeddate', 'completed_date', 'fecha completado', 'fecha_completado'].includes(normalized)) {
      map.completedDate = index;
    }
    // Resolved time patterns
    else if (['resolved time', 'resolvedtime', 'resolved_time', 'tiempo resolucion', 'tiempo_resolucion'].includes(normalized)) {
      map.resolvedTime = index;
    }
    // Category patterns
    else if (['category', 'categoria', 'categoría', 'type', 'tipo', 'service'].includes(normalized)) {
      map.category = index;
    }
    // Sub category patterns
    else if (['sub category', 'subcategory', 'sub_category', 'subcategoria', 'subcategoría'].includes(normalized)) {
      map.subCategory = index;
    }
    // Priority patterns
    else if (['priority', 'prioridad', 'importance', 'importancia'].includes(normalized)) {
      map.priority = index;
    }
    // Urgency patterns
    else if (['urgency', 'urgencia'].includes(normalized)) {
      map.urgency = index;
    }
    // Impact patterns
    else if (['impact', 'impacto'].includes(normalized)) {
      map.impact = index;
    }
    // Request type patterns
    else if (['request type', 'requesttype', 'request_type', 'tipo solicitud', 'tipo_solicitud'].includes(normalized)) {
      map.requestType = index;
    }
    // Department patterns
    else if (['department', 'departamento', 'area'].includes(normalized)) {
      map.department = index;
    }
    // Is overdue patterns
    else if (['is overdue', 'isoverdue', 'is_overdue', 'vencido', 'atrasado'].includes(normalized)) {
      map.isOverdue = index;
    }
    // Is response overdue patterns
    else if (['is response overdue', 'isresponseoverdue', 'is_response_overdue', 'respuesta vencida', 'respuesta_vencida'].includes(normalized)) {
      map.isResponseOverdue = index;
    }
    // Resolution patterns
    else if (['resolution', 'resolucion', 'resolución', 'solucion', 'solución'].includes(normalized)) {
      map.resolution = index;
    }
    // Resolution time patterns
    else if (['resolution time', 'resolutiontime', 'resolution_time', 'tiempo_resolucion_final'].includes(normalized)) {
      map.resolutionTime = index;
    }
  });
  
  // Set defaults for missing columns based on Excel structure
  if (map.requestId === undefined) map.requestId = 0;      // Request ID
  if (map.subject === undefined) map.subject = 1;          // Subject
  if (map.requesterName === undefined) map.requesterName = 2;  // Requester Name
  if (map.createdDate === undefined) map.createdDate = 3;      // Created Date
  if (map.description === undefined) map.description = 4;     // Description
  if (map.technician === undefined) map.technician = 5;       // Technician
  if (map.status === undefined) map.status = 6;               // Status
  if (map.dueByDate === undefined) map.dueByDate = 7;         // Due by date
  if (map.respondedDate === undefined) map.respondedDate = 8; // Responded Date
  if (map.completedDate === undefined) map.completedDate = 9; // Completed Date
  if (map.resolvedTime === undefined) map.resolvedTime = 10;  // Resolved Time
  if (map.category === undefined) map.category = 11;          // Category
  if (map.subCategory === undefined) map.subCategory = 12;    // Sub Category
  if (map.priority === undefined) map.priority = 14;          // Priority
  if (map.urgency === undefined) map.urgency = 15;            // Urgency
  if (map.impact === undefined) map.impact = 16;              // Impact
  if (map.requestType === undefined) map.requestType = 17;    // Request Type
  if (map.department === undefined) map.department = 22;      // Department
  if (map.isOverdue === undefined) map.isOverdue = 20;        // Is Overdue
  if (map.isResponseOverdue === undefined) map.isResponseOverdue = 21; // Is Response Overdue
  if (map.resolution === undefined) map.resolution = 26;      // Resolution
  if (map.resolutionTime === undefined) map.resolutionTime = 27; // Resolution Time
  
  return map;
}

// Parse Excel dates (handles Excel serial dates and various formats)
function parseExcelDate(value: any): string | null {
  if (!value) return null;
  
  try {
    // If it's a number, it might be an Excel serial date
    if (typeof value === 'number') {
      const date = XLSX.SSF.parse_date_code(value);
      if (date) {
        return new Date(date.y, date.m - 1, date.d, date.H || 0, date.M || 0, date.S || 0).toISOString();
      }
    }
    
    // If it's a string, try to parse it as a regular date
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed && trimmed !== '-') {
        // Handle various date formats
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) {
          return parsed.toISOString();
        }
        
        // Try alternative parsing for DD/MM/YYYY format
        const dateParts = trimmed.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (dateParts) {
          const [, day, month, year] = dateParts;
          const altDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(altDate.getTime())) {
            return altDate.toISOString();
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Date parsing error:', error);
    return null;
  }
}

// Existing CSV parsing function (keep for backward compatibility)
async function parseCSVToTickets(csvData: string) {
  const lines = csvData.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const tickets = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    
    if (values.length < headers.length) continue;

    try {
      const ticketData = {
        ticketId: sanitizeValue(values[0]) || `TICKET-${Date.now()}-${i}`,
        title: sanitizeValue(values[1]) || 'No Title',
        description: sanitizeValue(values[2]) || '',
        status: normalizeStatus(sanitizeValue(values[3]) || 'Abierto'),
        priority: normalizePriority(sanitizeValue(values[4]) || 'Media'),
        category: normalizeCategory(sanitizeValue(values[5]) || 'General'),
        technician: normalizeTechnician(sanitizeValue(values[6]) || 'No asignado'),
        createdAt: values[7] ? new Date(values[7]).toISOString() : new Date().toISOString(),
        resolvedAt: values[8] ? new Date(values[8]).toISOString() : null,
        responseTime: values[9] || null,
      };

      const validatedTicket = insertTicketSchema.parse(ticketData);
      tickets.push(validatedTicket);
    } catch (error) {
      console.warn(`Skipping invalid CSV row ${i + 1}:`, error);
      continue;
    }
  }

  return tickets;
}

// Clean HTML and unwanted content from cell values
function sanitizeValue(value: any): string | null {
  if (value === null || value === undefined) return null;
  
  let sanitized = value.toString().trim();
  
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove common Excel/CSV artifacts
  sanitized = sanitized.replace(/&nbsp;/g, ' ');
  sanitized = sanitized.replace(/&amp;/g, '&');
  sanitized = sanitized.replace(/&lt;/g, '<');
  sanitized = sanitized.replace(/&gt;/g, '>');
  sanitized = sanitized.replace(/&quot;/g, '"');
  
  // Remove extra whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized || null;
}

// Parse boolean values from Excel
function parseBoolean(value: any): boolean {
  if (value === null || value === undefined) return false;
  
  const stringValue = value.toString().toLowerCase().trim();
  return ['true', 'yes', 'sí', 'si', '1', 'verdadero'].includes(stringValue);
}

// Normalize status values
function normalizeStatus(status: string): string {
  const normalized = status.toLowerCase().trim();
  if (['cerrado', 'closed', 'resuelto', 'resolved', 'completado', 'complete'].includes(normalized)) {
    return 'Cerrado';
  }
  if (['abierto', 'open', 'nuevo', 'new'].includes(normalized)) {
    return 'Abierto';
  }
  if (['progreso', 'progress', 'en proceso', 'working', 'assigned'].includes(normalized)) {
    return 'En Progreso';
  }
  return 'Abierto'; // Default
}

// Normalize priority values
function normalizePriority(priority: string): string {
  const normalized = priority.toLowerCase().trim();
  if (['crítica', 'critica', 'critical', 'urgente', 'urgent'].includes(normalized)) {
    return 'Crítica';
  }
  if (['alta', 'high'].includes(normalized)) {
    return 'Alta';
  }
  if (['media', 'medium', 'normal'].includes(normalized)) {
    return 'Media';
  }
  if (['baja', 'low'].includes(normalized)) {
    return 'Baja';
  }
  return 'Media'; // Default
}

// Normalize category values
function normalizeCategory(category: string): string {
  const normalized = category.toLowerCase().trim();
  if (['hardware', 'hw'].includes(normalized)) {
    return 'Hardware';
  }
  if (['software', 'sw'].includes(normalized)) {
    return 'Software';
  }
  if (['red', 'network', 'networking'].includes(normalized)) {
    return 'Red';
  }
  if (['acceso', 'access', 'authentication', 'login'].includes(normalized)) {
    return 'Acceso';
  }
  return category || 'General'; // Keep original or default
}

// Normalize technician names
function normalizeTechnician(technician: string): string {
  if (!technician) return 'No asignado';
  
  // Clean and standardize technician names
  let normalized = technician.trim();
  
  // Handle common name variations
  const nameMapping: { [key: string]: string } = {
    'gelson munoz': 'Gelson Munoz',
    'gelson muñoz': 'Gelson Munoz',
    'gelson': 'Gelson Munoz',
    'munoz': 'Gelson Munoz',
    'muñoz': 'Gelson Munoz',
  };
  
  const lowerName = normalized.toLowerCase();
  if (nameMapping[lowerName]) {
    return nameMapping[lowerName];
  }
  
  // Capitalize first letter of each word
  return normalized.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Calculate status statistics
function calculateStatusStats(tickets: any[]) {
  const statusCounts: { [key: string]: number } = {};
  
  tickets.forEach(ticket => {
    statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1;
  });
  
  return Object.entries(statusCounts).map(([name, count]) => ({
    name,
    count
  }));
}

// Calculate category statistics
function calculateCategoryStats(tickets: any[]) {
  const categoryCounts: { [key: string]: number } = {};
  
  tickets.forEach(ticket => {
    categoryCounts[ticket.category] = (categoryCounts[ticket.category] || 0) + 1;
  });
  
  return Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count
  }));
}

// Calculate priority statistics
function calculatePriorityStats(tickets: any[]) {
  const priorityCounts: { [key: string]: number } = {};
  
  tickets.forEach(ticket => {
    priorityCounts[ticket.priority] = (priorityCounts[ticket.priority] || 0) + 1;
  });
  
  return Object.entries(priorityCounts).map(([name, count]) => ({
    name,
    count
  }));
}

// Calculate technician statistics
function calculateTechnicianStats(tickets: any[]) {
  const technicianData: { [key: string]: any } = {};
  
  tickets.forEach(ticket => {
    if (!technicianData[ticket.technician]) {
      technicianData[ticket.technician] = {
        name: ticket.technician,
        totalTickets: 0,
        resolvedTickets: 0,
        slaCompliant: 0,
        avgResolutionTime: 0
      };
    }
    
    const tech = technicianData[ticket.technician];
    tech.totalTickets++;
    
    if (ticket.status === 'Cerrado' || ticket.status === 'Closed') {
      tech.resolvedTickets++;
      
      if (calculateSLACompliance(ticket)) {
        tech.slaCompliant++;
      }
      
      // Calculate resolution time if available
      if (ticket.resolvedAt && ticket.createdAt) {
        const resolutionTime = (new Date(ticket.resolvedAt).getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60 * 24); // in days
        tech.avgResolutionTime = ((tech.avgResolutionTime * (tech.resolvedTickets - 1)) + resolutionTime) / tech.resolvedTickets;
      }
    }
  });
  
  return Object.values(technicianData);
}

// Calculate analytics
async function calculateAnalytics(tickets: any[]) {
  const totalTickets = tickets.length;
  const closedTickets = tickets.filter(t => t.status === 'Cerrado' || t.status === 'Closed').length;
  const overdueTickets = tickets.filter(t => isTicketOverdue(t)).length;
  
  // Calculate SLA compliance
  const slaCompliantTickets = tickets.filter(t => calculateSLACompliance(t)).length;
  const slaCompliance = totalTickets > 0 ? (slaCompliantTickets / totalTickets) * 100 : 0;
  
  // Calculate average resolution time
  const resolvedTickets = tickets.filter(t => t.resolvedAt && t.createdAt);
  const totalResolutionTime = resolvedTickets.reduce((sum, ticket) => {
    const resolutionTime = (new Date(ticket.resolvedAt).getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return sum + resolutionTime;
  }, 0);
  
  const avgResolutionTime = resolvedTickets.length > 0 ? totalResolutionTime / resolvedTickets.length : 0;
  
  return {
    totalTickets,
    slaCompliance,
    overdueTickets,
    avgResolutionTime
  };
}

// Get SLA target based on priority and category
function getSLATarget(priority: string, category: string): number {
  // SLA targets in hours based on your Excel specifications
  const slaMatrix: { [key: string]: number } = {
    'Crítica': 8,   // 4-8 hours max
    'Urgente': 8,   // 4-8 hours max  
    'Alta': 12,     // 8-12 hours max
    'Media': 72,    // 1-3 days (72 hours max)
    'Normal': 72,   // 1-3 days (72 hours max)
    'Baja': 120     // 3-5 days (120 hours max)
  };
  
  return slaMatrix[priority] || 72; // Default to 3 days
}

// Calculate if ticket is SLA compliant
function calculateSLACompliance(ticket: any): boolean {
  if (!ticket.createdAt) return false;
  
  const slaTarget = getSLATarget(ticket.priority, ticket.category);
  const createdTime = new Date(ticket.createdAt).getTime();
  const resolvedTime = ticket.resolvedAt ? new Date(ticket.resolvedAt).getTime() : Date.now();
  
  const timeDiff = resolvedTime - createdTime;
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  return hoursDiff <= slaTarget;
}

// Check if ticket is overdue
function isTicketOverdue(ticket: any): boolean {
  if (ticket.status === 'Cerrado' || ticket.status === 'Closed') return false;
  if (!ticket.createdAt) return false;
  
  const slaTarget = getSLATarget(ticket.priority, ticket.category);
  const createdTime = new Date(ticket.createdAt).getTime();
  const currentTime = Date.now();
  
  const timeDiff = currentTime - createdTime;
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  return hoursDiff > slaTarget;
}