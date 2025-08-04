import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusStats } from '@/types/ticket';
import { PieChart as PieChartIcon } from 'lucide-react';

interface StatusChartProps {
  data: StatusStats[];
}

const COLORS = ['#4CAF50', '#FF9800', '#FFC107', '#F44336', '#9C27B0', '#2196F3'];

export default function StatusChart({ data }: StatusChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.name,
    value: item.count,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PieChartIcon className="h-5 w-5 text-primary" />
          <span data-testid="status-chart-title">Ticket Status Distribution</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80" data-testid="status-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={40}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} tickets`,
                  name,
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string, entry: any) => (
                  <span style={{ color: entry.color }} data-testid={`legend-${value.toLowerCase().replace(/\s+/g, '-')}`}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
