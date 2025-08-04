import { Ticket, DashboardAnalytics, TechnicianStats } from '@/types/ticket';

export function calculateSLACompliance(tickets: Ticket[]): number {
  const ticketsWithSLA = tickets.filter(t => t.dueByDate);
  if (ticketsWithSLA.length === 0) return 0;

  const onTimeTickets = ticketsWithSLA.filter(t => {
    if (!t.completedDate || !t.dueByDate) return false;
    return new Date(t.completedDate) <= new Date(t.dueByDate);
  }).length;

  return (onTimeTickets / ticketsWithSLA.length) * 100;
}

export function calculateAvgResolutionTime(tickets: Ticket[]): number {
  const completedTickets = tickets.filter(t => t.createdDate && t.completedDate);
  if (completedTickets.length === 0) return 0;

  const totalTime = completedTickets.reduce((sum, ticket) => {
    const created = new Date(ticket.createdDate!).getTime();
    const completed = new Date(ticket.completedDate!).getTime();
    return sum + (completed - created);
  }, 0);

  // Return average time in days
  return totalTime / completedTickets.length / (1000 * 60 * 60 * 24);
}

export function groupTicketsByTechnician(tickets: Ticket[]): TechnicianStats[] {
  const stats: { [key: string]: TechnicianStats } = {};

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
  Object.values(stats).forEach(stat => {
    const totalWithSLA = stat.onTimeTickets + stat.overdueTickets;
    stat.slaCompliance = totalWithSLA > 0 
      ? (stat.onTimeTickets / totalWithSLA) * 100 
      : 0;
  });

  return Object.values(stats);
}

export function formatResolutionTime(days: number): string {
  if (days < 1) {
    const hours = Math.round(days * 24);
    return `${hours}h`;
  }
  return `${days.toFixed(1)}d`;
}

export function getPriorityColor(priority?: string): string {
  if (!priority) return 'bg-gray-100 text-gray-800';
  
  switch (priority.toLowerCase()) {
    case 'alto':
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medio':
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'bajo':
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusColor(status?: string): string {
  if (!status) return 'bg-gray-100 text-gray-800';
  
  const statusLower = status.toLowerCase();
  if (statusLower.includes('cerrada') || statusLower.includes('closed')) {
    return 'bg-green-100 text-green-800';
  } else if (statusLower.includes('progreso') || statusLower.includes('progress')) {
    return 'bg-blue-100 text-blue-800';
  } else if (statusLower.includes('espera') || statusLower.includes('waiting')) {
    return 'bg-yellow-100 text-yellow-800';
  } else if (statusLower.includes('abierto') || statusLower.includes('open')) {
    return 'bg-red-100 text-red-800';
  }
  
  return 'bg-gray-100 text-gray-800';
}
