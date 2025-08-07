import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';
import { Ticket } from '@/types/ticket';
import { format, startOfWeek, startOfMonth, addWeeks, addMonths, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface WeeklyMonthlyTrendsProps {
  tickets: Ticket[];
}

export default function WeeklyMonthlyTrends({ tickets }: WeeklyMonthlyTrendsProps) {
  // Calculate weekly trends for last 5 weeks
  const getWeeklyTrends = () => {
    const now = new Date();
    const weeks = [];

    for (let i = 4; i >= 0; i--) {
      const weekStart = startOfWeek(addWeeks(now, -i), { weekStartsOn: 1 });
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      
      const weekData = {
        period: `Semana${5 - i}`,
        'Entregados': 0,
        'Completados': 0,
        'Vencidos': 0
      };

      tickets.forEach(ticket => {
        if (!ticket.createdDate) return;
        
        const ticketDate = new Date(ticket.createdDate);
        if (isWithinInterval(ticketDate, { start: weekStart, end: weekEnd })) {
          weekData['Entregados']++;
          
          // Check if resolved/closed
          if (ticket.status?.toLowerCase().includes('cerrado') || 
              ticket.status?.toLowerCase().includes('resolved') ||
              ticket.status?.toLowerCase().includes('completado') ||
              ticket.status?.toLowerCase().includes('closed')) {
            weekData['Completados']++;
          }
          
          // Check if overdue
          if (ticket.isOverdue === true || ticket.isOverdue === 'true') {
            weekData['Vencidos']++;
          }
        }
      });

      weeks.push(weekData);
    }

    return weeks;
  };

  // Calculate daily trends for last 7 days (for weekly view)
  const getDailyTrends = () => {
    const now = new Date();
    const days = [];
    const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date(now);
      dayDate.setDate(now.getDate() - i);
      const dayStart = new Date(dayDate.setHours(0, 0, 0, 0));
      const dayEnd = new Date(dayDate.setHours(23, 59, 59, 999));
      
      const dayData = {
        period: dayLabels[dayStart.getDay()],
        'Entregados': 0,
        'Completados': 0,
        'Vencidos': 0
      };

      tickets.forEach(ticket => {
        if (!ticket.createdDate) return;
        
        const ticketDate = new Date(ticket.createdDate);
        
        // Count tickets created on this day
        if (isWithinInterval(ticketDate, { start: dayStart, end: dayEnd })) {
          dayData['Entregados']++;
        }
        
        // Count tickets completed on this day (check completion date if available, otherwise use created date)
        const completionDate = ticket.closedDate ? new Date(ticket.closedDate) : ticketDate;
        if ((ticket.status?.toLowerCase().includes('cerrado') || 
             ticket.status?.toLowerCase().includes('resolved') ||
             ticket.status?.toLowerCase().includes('completado') ||
             ticket.status?.toLowerCase().includes('closed')) &&
            isWithinInterval(completionDate, { start: dayStart, end: dayEnd })) {
          dayData['Completados']++;
        }
        
        // Count overdue tickets (created before today and still overdue)
        if ((ticket.isOverdue === true || ticket.isOverdue === 'true') &&
            ticketDate <= dayEnd) {
          dayData['Vencidos']++;
        }
      });

      days.push(dayData);
    }

    return days;
  };

  const weeklyData = getWeeklyTrends();
  const dailyData = getDailyTrends();

  // Calculate totals for legend
  const weeklyTotals = weeklyData.reduce((acc, week) => ({
    entregados: acc.entregados + week.Entregados,
    completados: acc.completados + week.Completados,
    vencidos: acc.vencidos + week.Vencidos
  }), { entregados: 0, completados: 0, vencidos: 0 });

  const dailyTotals = dailyData.reduce((acc, day) => ({
    entregados: acc.entregados + day.Entregados,
    completados: acc.completados + day.Completados,
    vencidos: acc.vencidos + day.Vencidos
  }), { entregados: 0, completados: 0, vencidos: 0 });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly Trends */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
            Solicitudes última mes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="period" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                angle={0}
                textAnchor="middle"
                height={40}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                wrapperStyle={{ color: '#374151', fontSize: '12px' }}
                verticalAlign="bottom"
                height={40}
              />
              <Line 
                type="monotone" 
                dataKey="Entregados" 
                name={`Entregados(${weeklyTotals.entregados})`}
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#3B82F6', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="Completados" 
                name={`Completados(${weeklyTotals.completados})`}
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#10B981', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="Vencidos" 
                name={`Vencidos(${weeklyTotals.vencidos})`}
                stroke="#EF4444" 
                strokeWidth={2}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#EF4444', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Solicitudes última semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="period" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                angle={0}
                textAnchor="middle"
                height={40}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                wrapperStyle={{ color: '#374151', fontSize: '12px' }}
                verticalAlign="bottom"
                height={40}
              />
              <Line 
                type="monotone" 
                dataKey="Entregados" 
                name={`Entregados(${dailyTotals.entregados})`}
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#3B82F6', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="Completados" 
                name={`Completados(${dailyTotals.completados})`}
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#10B981', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="Vencidos" 
                name={`Vencidos(${dailyTotals.vencidos})`}
                stroke="#EF4444" 
                strokeWidth={2}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#EF4444', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}