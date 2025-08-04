import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface SLATrendChartProps {
  slaCompliance: number;
}

export default function SLATrendChart({ slaCompliance }: SLATrendChartProps) {
  // Generate sample trend data based on current SLA compliance
  const generateTrendData = (currentSLA: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const baseVariation = 5; // +/- 5% variation
    
    return months.map((month, index) => {
      const variation = (Math.random() - 0.5) * baseVariation;
      const sla = Math.max(80, Math.min(100, currentSLA + variation));
      
      return {
        month,
        sla: parseFloat(sla.toFixed(1)),
      };
    });
  };

  const data = generateTrendData(slaCompliance);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span data-testid="sla-trend-title">SLA Performance Trend</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80" data-testid="sla-trend-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <YAxis 
                domain={[80, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'SLA Compliance']}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Line
                type="monotone"
                dataKey="sla"
                stroke="hsl(207, 90%, 54%)"
                strokeWidth={3}
                dot={{ fill: 'hsl(207, 90%, 54%)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(207, 90%, 54%)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
