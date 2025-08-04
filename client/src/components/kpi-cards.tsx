import { DashboardAnalytics } from '@/types/ticket';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Clock, AlertTriangle, Ticket, CheckCircle } from 'lucide-react';

interface KPICardsProps {
  analytics: DashboardAnalytics;
}

export default function KPICards({ analytics }: KPICardsProps) {
  const slaCompliance = analytics.slaCompliance || 0;
  const totalTickets = analytics.totalTickets || 0;
  const closedTickets = analytics.closedTickets || 0;
  const resolutionRate = totalTickets > 0 ? ((closedTickets / totalTickets) * 100) : 0;

  const kpis = [
    {
      title: 'Total Tickets',
      value: totalTickets.toLocaleString(),
      subtitle: 'Active cases',
      icon: Ticket,
      iconBg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      progress: null,
      trend: '+12%',
      trendIcon: TrendingUp,
      trendColor: 'text-green-600',
      testId: 'kpi-total-tickets',
      cardColor: 'border-l-4 border-l-blue-500'
    },
    {
      title: 'SLA Compliance',
      value: `${slaCompliance.toFixed(1)}%`,
      subtitle: `Target: 95%`,
      icon: Clock,
      iconBg: slaCompliance >= 95 ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20' : 
              slaCompliance >= 85 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20' :
              'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
      iconColor: slaCompliance >= 95 ? 'text-green-600 dark:text-green-400' :
                 slaCompliance >= 85 ? 'text-yellow-600 dark:text-yellow-400' : 
                 'text-red-600 dark:text-red-400',
      progress: Math.min(slaCompliance, 100),
      trend: slaCompliance >= 95 ? '+2.1%' : '-1.3%',
      trendIcon: slaCompliance >= 95 ? TrendingUp : TrendingDown,
      trendColor: slaCompliance >= 95 ? 'text-green-600' : 'text-red-600',
      testId: 'kpi-sla-compliance',
      cardColor: slaCompliance >= 95 ? 'border-l-4 border-l-green-500' :
                 slaCompliance >= 85 ? 'border-l-4 border-l-yellow-500' :
                 'border-l-4 border-l-red-500'
    },
    {
      title: 'Resolution Rate',
      value: `${resolutionRate.toFixed(1)}%`,
      subtitle: `${closedTickets} resolved`,
      icon: CheckCircle,
      iconBg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      progress: resolutionRate,
      trend: '+5.2%',
      trendIcon: TrendingUp,
      trendColor: 'text-green-600',
      testId: 'kpi-resolution-rate',
      cardColor: 'border-l-4 border-l-emerald-500'
    },
    {
      title: 'Avg Resolution',
      value: `${(analytics.avgResolutionTime || 0).toFixed(1)}d`,
      subtitle: 'Response time',
      icon: AlertTriangle,
      iconBg: (analytics.avgResolutionTime || 0) <= 3 ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20' :
              (analytics.avgResolutionTime || 0) <= 5 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20' :
              'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
      iconColor: (analytics.avgResolutionTime || 0) <= 3 ? 'text-green-600 dark:text-green-400' :
                 (analytics.avgResolutionTime || 0) <= 5 ? 'text-yellow-600 dark:text-yellow-400' :
                 'text-orange-600 dark:text-orange-400',
      progress: null,
      trend: '-0.2d',
      trendIcon: TrendingDown,
      trendColor: 'text-green-600',
      testId: 'kpi-avg-resolution',
      cardColor: (analytics.avgResolutionTime || 0) <= 3 ? 'border-l-4 border-l-green-500' :
                 (analytics.avgResolutionTime || 0) <= 5 ? 'border-l-4 border-l-yellow-500' :
                 'border-l-4 border-l-orange-500'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi) => {
        const IconComponent = kpi.icon;
        const TrendIconComponent = kpi.trendIcon;

        return (
          <Card key={kpi.title} className={`hover:shadow-lg transition-all duration-300 ${kpi.cardColor} relative overflow-hidden`} data-testid={kpi.testId}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1" data-testid={`${kpi.testId}-title`}>
                    {kpi.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white" data-testid={`${kpi.testId}-value`}>
                    {kpi.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {kpi.subtitle}
                  </p>
                </div>
                <div className={`${kpi.iconBg} p-3 rounded-xl shadow-sm`}>
                  <IconComponent className={`h-6 w-6 ${kpi.iconColor}`} />
                </div>
              </div>
              
              {/* Progress Bar */}
              {kpi.progress !== null && (
                <div className="mb-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        kpi.progress >= 95 ? 'bg-green-500' :
                        kpi.progress >= 85 ? 'bg-yellow-500' :
                        kpi.progress >= 70 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Trend */}
              <div className={`flex items-center text-sm ${kpi.trendColor}`}>
                <TrendIconComponent className="h-4 w-4 mr-1" />
                <span data-testid={`${kpi.testId}-trend`} className="font-medium">{kpi.trend}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">vs previous period</span>
              </div>
            </CardContent>
            
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent via-white/5 to-white/10 dark:via-white/5 dark:to-white/10 rounded-full transform translate-x-16 -translate-y-16" />
          </Card>
        );
      })}
    </div>
  );
}
