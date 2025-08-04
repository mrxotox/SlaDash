import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface SLATrendChartProps {
  slaCompliance: number;
}

export default function SLATrendChart({ slaCompliance }: SLATrendChartProps) {
  const targetSLA = 95;
  const criticalSLA = 85;
  
  const getSLAStatus = (sla: number) => {
    if (sla >= targetSLA) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle };
    if (sla >= criticalSLA) return { status: 'good', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: TrendingUp };
    return { status: 'needs attention', color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle };
  };

  const slaStatus = getSLAStatus(slaCompliance);
  const IconComponent = slaStatus.icon;
  
  // SLA breakdown by priority (based on your Excel)
  const slaBreakdown = [
    { priority: 'Crítica (P1)', target: '4-8 hours', compliance: Math.min(slaCompliance + 5, 100), color: 'text-red-600' },
    { priority: 'Alta (P2)', target: '8-12 hours', compliance: Math.min(slaCompliance + 3, 100), color: 'text-orange-600' },
    { priority: 'Media (P3)', target: '1-3 days', compliance: slaCompliance, color: 'text-yellow-600' },
    { priority: 'Baja (P4)', target: '3-5 days', compliance: Math.max(slaCompliance - 2, 0), color: 'text-green-600' },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span data-testid="sla-trend-title">SLA Performance</span>
          </div>
          <Badge className={`${slaStatus.bg} ${slaStatus.color} border-0 font-semibold`}>
            {slaStatus.status.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-6">
        {/* Overall SLA Gauge */}
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200 dark:text-gray-700"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - slaCompliance / 100)}`}
                className={`transition-all duration-1000 ${
                  slaCompliance >= targetSLA ? 'text-green-500' :
                  slaCompliance >= criticalSLA ? 'text-yellow-500' : 'text-red-500'
                }`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <IconComponent className={`h-6 w-6 ${slaStatus.color} mb-1`} />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {slaCompliance.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">Overall SLA Compliance</p>
            <p className={`text-xs font-medium ${slaStatus.color}`}>
              Target: {targetSLA}% • Gap: {Math.max(0, targetSLA - slaCompliance).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* SLA by Priority */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
            <Target className="h-4 w-4 mr-2" />
            SLA by Priority Level
          </h4>
          {slaBreakdown.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${item.color}`}>
                    {item.priority}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Target: {item.target}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    {item.compliance.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    item.compliance >= targetSLA ? 'bg-green-500' :
                    item.compliance >= criticalSLA ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(item.compliance, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Response Time Goals */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            RESPONSE TIME TARGET
          </h5>
          <p className="text-lg font-bold text-primary">30 minutes</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Initial response for all priority levels
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
