// Debug script to analyze July 2025 data discrepancy
import fs from 'fs';

async function analyzeJuly2025Data() {
  try {
    // Fetch all tickets from the API
    const response = await fetch('http://localhost:5000/api/tickets');
    const tickets = await response.json();
    
    console.log(`Total tickets loaded: ${tickets.length}`);
    
    // Filter tickets for July 2025
    const july2025Tickets = tickets.filter(ticket => {
      if (!ticket.createdDate) return false;
      
      const ticketDate = new Date(ticket.createdDate);
      const year = ticketDate.getFullYear();
      const month = ticketDate.getMonth(); // 0-based, so July = 6
      
      return year === 2025 && month === 6; // July 2025
    });
    
    console.log(`\n=== JULY 2025 DATA ANALYSIS ===`);
    console.log(`Total tickets in July 2025: ${july2025Tickets.length}`);
    
    // Filter out canceled tickets
    const validJuly2025Tickets = july2025Tickets.filter(ticket => 
      !ticket.status?.toLowerCase().includes('cancelado') &&
      !ticket.status?.toLowerCase().includes('canceled') &&
      !ticket.status?.toLowerCase().includes('cancelled')
    );
    
    console.log(`Valid tickets (excluding canceled): ${validJuly2025Tickets.length}`);
    
    // Count by status
    const statusCounts = {};
    validJuly2025Tickets.forEach(ticket => {
      const status = ticket.status || 'Sin estado';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    console.log(`\nStatus breakdown:`);
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    
    // Count entregados, completados, vencidos for July 2025
    let entregados = validJuly2025Tickets.length;
    let completados = validJuly2025Tickets.filter(ticket => 
      ticket.status?.toLowerCase().includes('cerrada') ||
      ticket.status?.toLowerCase().includes('cerrado') || 
      ticket.status?.toLowerCase().includes('resolved') ||
      ticket.status?.toLowerCase().includes('completado') ||
      ticket.status?.toLowerCase().includes('closed')
    ).length;
    let vencidos = validJuly2025Tickets.filter(ticket => 
      ticket.isOverdue === true || ticket.isOverdue === 'true'
    ).length;
    
    console.log(`\n=== JULY 2025 WEEKLY BREAKDOWN ===`);
    console.log(`Entregados (created): ${entregados}`);
    console.log(`Completados (closed): ${completados}`);
    console.log(`Vencidos (overdue): ${vencidos}`);
    
    // Weekly breakdown for July 2025
    const weeks = [];
    for (let week = 1; week <= 5; week++) {
      const weekTickets = validJuly2025Tickets.filter(ticket => {
        const ticketDate = new Date(ticket.createdDate);
        const dayOfMonth = ticketDate.getDate();
        
        // Rough weekly breakdown (not exact but for comparison)
        const weekStart = (week - 1) * 7 + 1;
        const weekEnd = week * 7;
        
        return dayOfMonth >= weekStart && dayOfMonth <= weekEnd;
      });
      
      const weekEntregados = weekTickets.length;
      const weekCompletados = weekTickets.filter(ticket => 
        ticket.status?.toLowerCase().includes('cerrado') || 
        ticket.status?.toLowerCase().includes('resolved') ||
        ticket.status?.toLowerCase().includes('completado') ||
        ticket.status?.toLowerCase().includes('closed')
      ).length;
      const weekVencidos = weekTickets.filter(ticket => 
        ticket.isOverdue === true || ticket.isOverdue === 'true'
      ).length;
      
      console.log(`Week ${week}: Entregados(${weekEntregados}) Completados(${weekCompletados}) Vencidos(${weekVencidos})`);
    }
    
    // Sample of tickets for debugging
    console.log(`\n=== SAMPLE JULY 2025 TICKETS ===`);
    validJuly2025Tickets.slice(0, 5).forEach((ticket, i) => {
      console.log(`${i+1}. Date: ${ticket.createdDate}, Status: ${ticket.status}, Overdue: ${ticket.isOverdue}`);
    });
    
  } catch (error) {
    console.error('Error analyzing July 2025 data:', error);
  }
}

analyzeJuly2025Data();