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

  // Calculate monthly trends for last 7 months
  const getMonthlyTrends = () => {
    const now = new Date();
    const months = [];
    const monthLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    for (let i = 6; i >= 0; i--) {
      const monthStart = startOfMonth(addMonths(now, -i));
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      
      const monthData = {
        period: monthLabels[6 - i] || `M${7 - i}`,
        'Entregados': 0,
        'Completados': 0,
        'Vencidos': 0
      };

      tickets.forEach(ticket => {
        if (!ticket.createdDate) return;
        
        const ticketDate = new Date(ticket.createdDate);
        if (isWithinInterval(ticketDate, { start: monthStart, end: monthEnd })) {
          monthData['Entregados']++;
          
          // Check if resolved/closed
          if (ticket.status?.toLowerCase().includes('cerrado') || 
              ticket.status?.toLowerCase().includes('resolved') ||
              ticket.status?.toLowerCase().includes('completado') ||
              ticket.status?.toLowerCase().includes('closed')) {
            monthData['Completados']++;
          }
          
          // Check if overdue
          if (ticket.isOverdue === true || ticket.isOverdue === 'true') {
            monthData['Vencidos']++;
          }
        }
      });

      months.push(monthData);
    }

    return months;
  };

  const weeklyData = getWeeklyTrends();
  const monthlyData = getMonthlyTrends();

  // Calculate totals for legend
  const weeklyTotals = weeklyData.reduce((acc, week) => ({
    entregados: acc.entregados + week.Entregados,
    completados: acc.completados + week.Completados,
    vencidos: acc.vencidos + week.Vencidos
  }), { entregados: 0, completados: 0, vencidos: 0 });

  const monthlyTotals = monthlyData.reduce((acc, month) => ({
    entregados: acc.entregados + month.Entregados,
    completados: acc.completados + month.Completados,
    vencidos: acc.vencidos + month.Vencidos
  }), { entregados: 0, completados: 0, vencidos: 0 });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly Trends */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
            Solicita última mes
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
            Solicita última semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
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
                name={`Entregados(${monthlyTotals.entregados})`}
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#3B82F6', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="Completados" 
                name={`Completados(${monthlyTotals.completados})`}
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#10B981', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="Vencidos" 
                name={`Vencidos(${monthlyTotals.vencidos})`}
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