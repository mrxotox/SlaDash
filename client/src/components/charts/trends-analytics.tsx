import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar, Clock } from 'lucide-react';
import { Ticket } from '@/types/ticket';

interface TrendsAnalyticsProps {
  tickets: Ticket[];
}

export default function TrendsAnalytics({ tickets }: TrendsAnalyticsProps) {
  // Calculate weekly trends
  const getWeeklyTrends = () => {
    const weeks: { [key: string]: { created: number, resolved: number, week: string } } = {};
    
    tickets.forEach(ticket => {
      if (!ticket.createdDate) return;
      
      const date = new Date(ticket.createdDate);
      const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      const weekLabel = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { created: 0, resolved: 0, week: weekLabel };
      }
      
      weeks[weekKey].created++;
      
      // Check if resolved in the same week
      if (ticket.resolvedTime) {
        const resolvedDate = new Date(ticket.resolvedTime);
        const resolvedWeekStart = new Date(resolvedDate.getFullYear(), resolvedDate.getMonth(), resolvedDate.getDate() - resolvedDate.getDay());
        const resolvedWeekKey = resolvedWeekStart.toISOString().split('T')[0];
        
        if (resolvedWeekKey === weekKey) {
          weeks[weekKey].resolved++;
        }
      }
    });
    
    return Object.values(weeks)
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8); // Last 8 weeks
  };

  // Calculate daily productivity
  const getDailyProductivity = () => {
    const days: { [key: string]: { count: number, day: string } } = {};
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    tickets.forEach(ticket => {
      if (!ticket.createdDate) return;
      
      const date = new Date(ticket.createdDate);
      const dayIndex = date.getDay();
      const dayName = dayNames[dayIndex];
      
      if (!days[dayName]) {
        days[dayName] = { count: 0, day: dayName };
      }
      
      days[dayName].count++;
    });
    
    return dayNames.map(day => days[day] || { count: 0, day });
  };

  // Calculate resolution time trends
  const getResolutionTimeTrends = () => {
    const resolved = tickets.filter(t => t.resolvedTime && t.createdDate);
    const trends: { [key: string]: { avgTime: number, count: number, month: string } } = {};
    
    resolved.forEach(ticket => {
      const created = new Date(ticket.createdDate!);
      const resolved = new Date(ticket.resolvedTime!);
      const resolutionDays = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      
      const monthKey = `${created.getFullYear()}-${created.getMonth() + 1}`;
      const monthLabel = `${created.getMonth() + 1}/${created.getFullYear()}`;
      
      if (!trends[monthKey]) {
        trends[monthKey] = { avgTime: 0, count: 0, month: monthLabel };
      }
      
      trends[monthKey].avgTime += resolutionDays;
      trends[monthKey].count++;
    });
    
    return Object.values(trends)
      .map(trend => ({
        ...trend,
        avgTime: trend.count > 0 ? trend.avgTime / trend.count : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  };

  const weeklyData = getWeeklyTrends();
  const dailyData = getDailyProductivity();
  const resolutionData = getResolutionTimeTrends();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Tendencias Semanales</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Tickets creados vs resueltos por semana
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="created" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Creados"
                />
                <Line 
                  type="monotone" 
                  dataKey="resolved" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Resueltos"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>Distribución por Día</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Carga de trabajo por día de la semana
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="count" 
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resolution Time Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <span>Tendencia de Tiempo de Resolución</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tiempo promedio de resolución por mes (en días)
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={resolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)} días`, 'Tiempo promedio']}
              />
              <Line 
                type="monotone" 
                dataKey="avgTime" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ r: 6 }}
                name="Tiempo promedio"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}