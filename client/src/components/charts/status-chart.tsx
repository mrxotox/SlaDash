import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusStats } from '@/types/ticket';
import { Activity } from 'lucide-react';

interface StatusChartProps {
  data: StatusStats[];
}

const STATUS_COLORS: Record<string, string> = {
  'Cerrada': '#22c55e',         // Green - Closed tickets
  'Cerrado': '#22c55e',
  'Abierto': '#3b82f6',         // Blue - Open tickets  
  'Abierta': '#3b82f6',
  'En espera por el usuario': '#f59e0b',  // Orange - Waiting
  'En Espera de Aprobación': '#f59e0b',
  'Escalado al equipo de QA': '#ef4444',  // Red - Escalated
  'Escalado al Proveedor de KCP': '#ef4444',
  'Validación en Curso': '#8b5cf6',       // Purple - In validation
  'Cancelado': '#6b7280',                 // Gray - Cancelled
  'En Progreso': '#06b6d4',               // Cyan - In progress
  'Retraso por Proceso': '#f97316',       // Orange - Delayed
};

export default function StatusChart({ data }: StatusChartProps) {
  // Clean and sort data by count (descending)
  const chartData = data
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8) // Show top 8 statuses
    .map(item => ({
      name: item.name.length > 20 ? `${item.name.substring(0, 20)}...` : item.name,
      fullName: item.name,
      count: item.count,
      color: STATUS_COLORS[item.name] || '#64748b',
      percentage: ((item.count / data.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(1)
    }));

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span data-testid="status-chart-title">Status Distribution</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {data.reduce((sum, d) => sum + d.count, 0)} total tickets
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center space-x-3" data-testid={`status-item-${index}`}>
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={item.fullName}>
                    {item.name}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>{item.count}</span>
                    <span className="text-xs">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: item.color, 
                      width: `${item.percentage}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
