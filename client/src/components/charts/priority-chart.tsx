import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PriorityStats } from '@/types/ticket';
import { AlertTriangle, Clock, CheckCircle, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PriorityChartProps {
  data: PriorityStats[];
}

const PRIORITY_CONFIG = {
  'Crítica': { 
    color: '#ef4444', 
    bgColor: 'bg-red-50 dark:bg-red-900/20', 
    textColor: 'text-red-700 dark:text-red-400',
    sla: '4-8 hours',
    icon: AlertTriangle,
    urgency: 'Critical'
  },
  'Urgente': { 
    color: '#f97316', 
    bgColor: 'bg-orange-50 dark:bg-orange-900/20', 
    textColor: 'text-orange-700 dark:text-orange-400',
    sla: '4-8 hours',
    icon: AlertTriangle,
    urgency: 'Critical'
  },
  'Alta': { 
    color: '#f59e0b', 
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', 
    textColor: 'text-yellow-700 dark:text-yellow-400',
    sla: '8-12 hours',
    icon: Clock,
    urgency: 'High'
  },
  'Media': { 
    color: '#3b82f6', 
    bgColor: 'bg-blue-50 dark:bg-blue-900/20', 
    textColor: 'text-blue-700 dark:text-blue-400',
    sla: '1-3 days',
    icon: Minus,
    urgency: 'Medium'
  },
  'Normal': { 
    color: '#3b82f6', 
    bgColor: 'bg-blue-50 dark:bg-blue-900/20', 
    textColor: 'text-blue-700 dark:text-blue-400',
    sla: '1-3 days',
    icon: Minus,
    urgency: 'Medium'
  },
  'Baja': { 
    color: '#22c55e', 
    bgColor: 'bg-green-50 dark:bg-green-900/20', 
    textColor: 'text-green-700 dark:text-green-400',
    sla: '3-5 days',
    icon: CheckCircle,
    urgency: 'Low'
  }
};

export default function PriorityChart({ data }: PriorityChartProps) {
  const filteredData = data
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);

  const totalTickets = filteredData.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...filteredData.map(item => item.count));

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <span data-testid="priority-chart-title">Priority Distribution</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {totalTickets} tickets • {filteredData.length} priorities
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {filteredData.map((item, index) => {
            const config = PRIORITY_CONFIG[item.name as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG['Normal'];
            const percentage = ((item.count / totalTickets) * 100).toFixed(1);
            const intensity = (item.count / maxCount) * 100;
            const IconComponent = config.icon;
            
            return (
              <div 
                key={index} 
                className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${config.bgColor} hover:shadow-md transition-all duration-200`}
                data-testid={`priority-item-${index}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <IconComponent className={`h-4 w-4 ${config.textColor}`} />
                    </div>
                    <div>
                      <h4 className={`text-sm font-semibold ${config.textColor}`}>
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        SLA: {config.sla}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      className={`${config.bgColor} ${config.textColor} border-0 font-semibold mb-1`}
                    >
                      {item.count}
                    </Badge>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {percentage}%
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Volume</span>
                    <Badge variant="outline" className="text-xs">
                      {config.urgency}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        backgroundColor: config.color,
                        width: `${intensity}%`,
                        opacity: 0.8
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* SLA Summary */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">
            SLA TARGETS BY PRIORITY
          </h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-red-600 dark:text-red-400">
              <span className="font-medium">P1 Crítica/Urgente:</span> 4-8h
            </div>
            <div className="text-yellow-600 dark:text-yellow-400">
              <span className="font-medium">P2 Alta:</span> 8-12h
            </div>
            <div className="text-blue-600 dark:text-blue-400">
              <span className="font-medium">P3 Media:</span> 1-3 days
            </div>
            <div className="text-green-600 dark:text-green-400">
              <span className="font-medium">P4 Baja:</span> 3-5 days
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}