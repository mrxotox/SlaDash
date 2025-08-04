import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TechnicianStats } from '@/types/ticket';
import { Users } from 'lucide-react';

interface TechnicianChartProps {
  data: TechnicianStats[];
}

export default function TechnicianChart({ data }: TechnicianChartProps) {
  const chartData = data.map(tech => ({
    name: tech.name.length > 12 ? `${tech.name.substring(0, 12)}...` : tech.name,
    fullName: tech.name,
    sla: tech.slaCompliance,
    tickets: tech.totalTickets,
  }));

  const getBarColor = (sla: number) => {
    if (sla >= 95) return '#4CAF50'; // Green
    if (sla >= 90) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-primary" />
          <span data-testid="technician-chart-title">Technician Performance</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80" data-testid="technician-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="horizontal" margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                type="number"
                domain={[80, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#666' }}
                width={80}
              />
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value.toFixed(1)}% SLA Compliance`,
                  `${props.payload.fullName} (${props.payload.tickets} tickets)`,
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar 
                dataKey="sla" 
                fill="hsl(207, 90%, 54%)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
