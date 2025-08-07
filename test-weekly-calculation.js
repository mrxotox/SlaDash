// Test new weekly calculation to match official tool
import { startOfWeek, addWeeks, isWithinInterval } from 'date-fns';

async function testWeeklyCalculation() {
  try {
    const response = await fetch('http://localhost:5000/api/tickets');
    const tickets = await response.json();
    
    // Filter valid tickets
    const validTickets = tickets.filter(ticket => 
      !ticket.status?.toLowerCase().includes('cancelado') &&
      !ticket.status?.toLowerCase().includes('canceled') &&
      !ticket.status?.toLowerCase().includes('cancelled')
    );
    
    console.log(`=== NEW WEEKLY CALCULATION (July 2025 Based) ===\n`);
    
    const july2025 = new Date(2025, 6, 1); // July 1, 2025
    let totalEntregados = 0, totalCompletados = 0, totalVencidos = 0;
    
    for (let i = 0; i < 5; i++) {
      const weekStart = startOfWeek(addWeeks(july2025, i), { weekStartsOn: 1 });
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      
      console.log(`Week ${i + 1}: ${weekStart.toDateString()} to ${weekEnd.toDateString()}`);
      
      let weekEntregados = 0, weekCompletados = 0, weekVencidos = 0;
      
      validTickets.forEach(ticket => {
        if (!ticket.createdDate) return;
        
        const ticketDate = new Date(ticket.createdDate);
        if (isWithinInterval(ticketDate, { start: weekStart, end: weekEnd })) {
          weekEntregados++;
          
          // Check if resolved/closed
          if (ticket.status?.toLowerCase().includes('cerrada') || 
              ticket.status?.toLowerCase().includes('cerrado') || 
              ticket.status?.toLowerCase().includes('resolved') ||
              ticket.status?.toLowerCase().includes('completado') ||
              ticket.status?.toLowerCase().includes('closed')) {
            weekCompletados++;
          }
          
          // Check if overdue
          if (ticket.isOverdue === true || ticket.isOverdue === 'true') {
            weekVencidos++;
          }
        }
      });
      
      console.log(`  Entregados: ${weekEntregados}, Completados: ${weekCompletados}, Vencidos: ${weekVencidos}`);
      
      totalEntregados += weekEntregados;
      totalCompletados += weekCompletados;
      totalVencidos += weekVencidos;
    }
    
    console.log(`\n=== TOTALS ===`);
    console.log(`Total Entregados: ${totalEntregados}`);
    console.log(`Total Completados: ${totalCompletados}`);
    console.log(`Total Vencidos: ${totalVencidos}`);
    
    console.log(`\n=== COMPARISON WITH OFFICIAL TOOL ===`);
    console.log(`Official: Entregados(353) Completados(240) Vencidos(15)`);
    console.log(`Ours:     Entregados(${totalEntregados}) Completados(${totalCompletados}) Vencidos(${totalVencidos})`);
    console.log(`Diff:     Entregados(${353 - totalEntregados}) Completados(${240 - totalCompletados}) Vencidos(${15 - totalVencidos})`);
    
  } catch (error) {
    console.error('Error in weekly calculation test:', error);
  }
}

testWeeklyCalculation();