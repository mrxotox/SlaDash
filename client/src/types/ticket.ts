export interface Ticket {
  id: string;
  requestId: string;
  subject: string;
  requesterName: string;
  createdDate: Date | null;
  description?: string;
  technician?: string;
  status: string;
  dueByDate?: Date | null;
  respondedDate?: Date | null;
  completedDate?: Date | null;
  resolvedTime?: string;
  category?: string;
  subCategory?: string;
  priority?: string;
  urgency?: string;
  impact?: string;
  requestType?: string;
  department?: string;
  isOverdue?: boolean;
  isResponseOverdue?: boolean;
  resolution?: string;
  resolutionTime?: string;
}

export interface DashboardAnalytics {
  totalTickets: number;
  slaCompliance: number;
  overdueTickets: number;
  closedTickets: number;
  avgResolutionTime: number;
}

export interface TechnicianStats {
  name: string;
  totalTickets: number;
  onTimeTickets: number;
  overdueTickets: number;
  slaCompliance: number;
}

export interface CategoryStats {
  name: string;
  count: number;
}

export interface PriorityStats {
  name: string;
  count: number;
}

export interface StatusStats {
  name: string;
  count: number;
}

export interface DashboardData {
  analytics: DashboardAnalytics | null;
  technicianStats: TechnicianStats[];
  categoryStats: CategoryStats[];
  priorityStats: PriorityStats[];
  statusStats: StatusStats[];
  departmentStats: CategoryStats[];
  requestTypeStats: CategoryStats[];
  allTickets: Ticket[];
  message?: string;
}

export interface TicketFilters {
  technician?: string;
  category?: string;
  priority?: string;
  status?: string;
  requestType?: string;
  department?: string;
  searchTerm?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
