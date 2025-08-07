// Enhanced debug script to compare with official tool
import fs from 'fs';

async function compareWithOfficialTool() {
  try {
    const response = await fetch('http://localhost:5000/api/tickets');
    const tickets = await response.json();
    
    console.log(`=== COMPARISON WITH OFFICIAL TOOL ===\n`);
    
    // Official tool shows (from the dark screenshot):
    // Week 1: Blue(51), Green(23), Red(6)
    // Week 2: Blue(107), Green(80), Red(5) 
    // Week 3: Blue(75), Green(52), Red(2)
    // Week 4: Blue(59), Green(39), Red(2)
    // Week 5: Blue(61), Green(46), Red(0)
    // Total: Blue(353), Green(240), Red(15)
    
    const officialData = {
      total: { entregados: 353, completados: 240, vencidos: 15 },
      weekly: [
        { week: 1, entregados: 51, completados: 23, vencidos: 6 },
        { week: 2, entregados: 107, completados: 80, vencidos: 5 },
        { week: 3, entregados: 75, completados: 52, vencidos: 2 },
        { week: 4, entregados: 59, completados: 39, vencidos: 2 },
        { week: 5, entregados: 61, completados: 46, vencidos: 0 }
      ]
    };
    
    // Get all tickets in July 2025
    const july2025Tickets = tickets.filter(ticket => {
      if (!ticket.createdDate) return false;
      const ticketDate = new Date(ticket.createdDate);
      return ticketDate.getFullYear() === 2025 && ticketDate.getMonth() === 6;
    });
    
    // Filter out canceled
    const validJuly2025Tickets = july2025Tickets.filter(ticket => 
      !ticket.status?.toLowerCase().includes('cancelado') &&
      !ticket.status?.toLowerCase().includes('canceled') &&
      !ticket.status?.toLowerCase().includes('cancelled')
    );
    
    console.log(`Our July 2025 data:`);
    console.log(`Total entregados: ${validJuly2025Tickets.length}`);
    console.log(`Total completados: ${validJuly2025Tickets.filter(t => 
      t.status?.toLowerCase().includes('cerrada') ||
      t.status?.toLowerCase().includes('cerrado')
    ).length}`);
    console.log(`Total vencidos: ${validJuly2025Tickets.filter(t => 
      t.isOverdue === true || t.isOverdue === 'true'
    ).length}`);
    
    console.log(`\nOfficial tool data:`);
    console.log(`Total entregados: ${officialData.total.entregados}`);
    console.log(`Total completados: ${officialData.total.completados}`);
    console.log(`Total vencidos: ${officialData.total.vencidos}`);
    
    // Check if we have more data outside July 2025
    const allValidTickets = tickets.filter(ticket => 
      !ticket.status?.toLowerCase().includes('cancelado') &&
      !ticket.status?.toLowerCase().includes('canceled') &&
      !ticket.status?.toLowerCase().includes('cancelled')
    );
    
    console.log(`\n=== BROADER ANALYSIS ===`);
    console.log(`Total tickets in our database: ${allValidTickets.length}`);
    
    // Date range in our data
    const dates = allValidTickets
      .filter(t => t.createdDate)
      .map(t => new Date(t.createdDate))
      .sort((a, b) => a - b);
    
    if (dates.length > 0) {
      console.log(`Date range: ${dates[0].toDateString()} to ${dates[dates.length-1].toDateString()}`);
    }
    
    // Check tickets in different months
    const monthCounts = {};
    allValidTickets.forEach(ticket => {
      if (!ticket.createdDate) return;
      const date = new Date(ticket.createdDate);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });
    
    console.log(`\nTickets by month:`);
    Object.entries(monthCounts).sort().forEach(([month, count]) => {
      console.log(`  ${month}: ${count} tickets`);
    });
    
    // Hypothesis: Official tool might be including different date ranges or criteria
    console.log(`\n=== HYPOTHESIS TESTING ===`);
    
    // Test 1: Maybe they're counting differently by week
    console.log(`1. Our weekly calculation logic might differ from theirs`);
    
    // Test 2: Maybe they include a different date range
    console.log(`2. They might include tickets from late June or early August`);
    
    // Test 3: Maybe they count resolved date instead of created date
    console.log(`3. They might use different date fields for different metrics`);
    
    // Show tickets around July borders
    const borderTickets = allValidTickets.filter(ticket => {
      if (!ticket.createdDate) return false;
      const date = new Date(ticket.createdDate);
      return (date.getFullYear() === 2025 && date.getMonth() === 5 && date.getDate() >= 25) ||
             (date.getFullYear() === 2025 && date.getMonth() === 7 && date.getDate() <= 7);
    });
    
    console.log(`\nTickets near July borders (June 25 - Aug 7): ${borderTickets.length}`);
    
  } catch (error) {
    console.error('Error in comparison:', error);
  }
}

compareWithOfficialTool();