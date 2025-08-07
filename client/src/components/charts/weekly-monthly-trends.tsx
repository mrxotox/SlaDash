import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';
import { Ticket } from '@/types/ticket';
import { format, startOfWeek, startOfMonth, addWeeks, addMonths, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface WeeklyMonthlyTrendsProps {
  tickets: Ticket[];
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-3 rounded-lg shadow-lg border">
        <p className="text-white font-medium">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function WeeklyMonthlyTrends({ tickets }: WeeklyMonthlyTrendsProps) {
  // Calculate weekly trends for last 5 weeks
  const getWeeklyTrends = () => {
    const now = new Date();
    const weeks = [];

    for (let i = 4; i >= 0; i--) {
      const weekStart = startOfWeek(addWeeks(now, -i), { weekStartsOn: 1 });
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      
      const weekData = {
        period: `Semana${i === 0 ? '5' : i === 1 ? '4' : i === 2 ? '3' : i === 3 ? '2' : '1'}`,
        'Entregados': 0,
        'Completados': 0,
        'Vencidos': 0
      };

      tickets.forEach(ticket => {
        if (!ticket.createdDate) return;
        
        const ticketDate = new Date(ticket.createdDate);
        if (isWithinInterval(ticketDate, { start: weekStart, end: weekEnd })) {
          weekData['Entregados']++;
          
          // Check if completed
          if (ticket.status?.toLowerCase().includes('cerrado') || 
              ticket.status?.toLowerCase().includes('resolved') ||
              ticket.status?.toLowerCase().includes('completado')) {
            weekData['Completados']++;
          }
          
          // Check if overdue
          if (ticket.isOverdue) {
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
          
          // Check if completed
          if (ticket.status?.toLowerCase().includes('cerrado') || 
              ticket.status?.toLowerCase().includes('resolved') ||
              ticket.status?.toLowerCase().includes('completado')) {
            monthData['Completados']++;
          }
          
          // Check if overdue
          if (ticket.isOverdue) {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly Trends */}
      <Card className="bg-gray-900">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <Calendar className="h-5 w-5 text-blue-400" />
            Solicita última mes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="period" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ color: '#9CA3AF', fontSize: '12px' }}
                verticalAlign="bottom"
                height={36}
              />
              <Line 
                type="monotone" 
                dataKey="Entregados" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="Completados" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="Vencidos" 
                stroke="#EF4444" 
                strokeWidth={3}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card className="bg-gray-900">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Solicita última semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="period" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ color: '#9CA3AF', fontSize: '12px' }}
                verticalAlign="bottom"
                height={36}
              />
              <Line 
                type="monotone" 
                dataKey="Entregados" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="Completados" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="Vencidos" 
                stroke="#EF4444" 
                strokeWidth={3}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}