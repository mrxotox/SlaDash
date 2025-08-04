import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryStats } from '@/types/ticket';
import { BarChart3 } from 'lucide-react';

interface CategoryChartProps {
  data: CategoryStats[];
}

export default function CategoryChart({ data }: CategoryChartProps) {
  // Sort by count and take top 10
  const sortedData = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(item => ({
      ...item,
      name: item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span data-testid="category-chart-title">Tickets by Category</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80" data-testid="category-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#666' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} tickets`,
                  'Count',
                ]}
                labelFormatter={(label) => `Category: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar 
                dataKey="count" 
                fill="hsl(207, 90%, 54%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
