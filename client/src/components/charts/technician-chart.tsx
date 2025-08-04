import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TechnicianStats } from '@/types/ticket';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TechnicianChartProps {
  data: TechnicianStats[];
}

export default function TechnicianChart({ data }: TechnicianChartProps) {
  // Filter and sort technicians by total tickets (show only those with tickets)
  const filteredData = data
    .filter(tech => tech.totalTickets > 0)
    .sort((a, b) => b.totalTickets - a.totalTickets)
    .slice(0, 10); // Show top 10 technicians

  const getSLAColor = (sla: number) => {
    if (sla >= 95) return 'text-green-600 bg-green-50';
    if (sla >= 85) return 'text-yellow-600 bg-yellow-50';
    if (sla >= 70) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getSLAIcon = (sla: number) => {
    if (sla >= 90) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (sla >= 70) return <Minus className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const totalTickets = filteredData.reduce((sum, tech) => sum + tech.totalTickets, 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span data-testid="technician-chart-title">Technician Performance</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredData.length} technicians • {totalTickets} tickets
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {filteredData.map((tech, index) => {
            const workloadPercentage = ((tech.totalTickets / totalTickets) * 100).toFixed(1);
            
            return (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50" data-testid={`tech-item-${index}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={tech.name}>
                      {tech.name}
                    </h4>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600 dark:text-gray-400">
                      <span>{tech.totalTickets} tickets ({workloadPercentage}%)</span>
                      <span>•</span>
                      <span>{tech.onTimeTickets} on-time</span>
                      <span>•</span>
                      <span>{tech.overdueTickets} overdue</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getSLAIcon(tech.slaCompliance)}
                    <Badge className={`${getSLAColor(tech.slaCompliance)} border-0 font-semibold`}>
                      {tech.slaCompliance.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {/* SLA Progress Bar */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">SLA Compliance</span>
                    <span className="font-medium">{tech.slaCompliance.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        tech.slaCompliance >= 95 ? 'bg-green-500' :
                        tech.slaCompliance >= 85 ? 'bg-yellow-500' :
                        tech.slaCompliance >= 70 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(tech.slaCompliance, 100)}%` }}
                    />
                  </div>
                  
                  {/* Workload Progress Bar */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Workload</span>
                    <span className="font-medium">{workloadPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${workloadPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
