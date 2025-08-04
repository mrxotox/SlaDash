import { DashboardAnalytics } from '@/types/ticket';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Clock, AlertTriangle, Ticket, CheckCircle } from 'lucide-react';

interface KPICardsProps {
  analytics: DashboardAnalytics;
}

export default function KPICards({ analytics }: KPICardsProps) {
  const kpis = [
    {
      title: 'Total Tickets',
      value: analytics.totalTickets.toLocaleString(),
      icon: Ticket,
      iconBg: 'bg-blue-100',
      iconColor: 'text-primary',
      trend: '+12%',
      trendIcon: TrendingUp,
      trendColor: 'text-green-600',
      testId: 'kpi-total-tickets'
    },
    {
      title: 'SLA Compliance',
      value: `${(analytics.slaCompliance || 0).toFixed(1)}%`,
      icon: Clock,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      trend: (analytics.slaCompliance || 0) >= 95 ? '+2.1%' : '-1.3%',
      trendIcon: (analytics.slaCompliance || 0) >= 95 ? TrendingUp : TrendingDown,
      trendColor: (analytics.slaCompliance || 0) >= 95 ? 'text-green-600' : 'text-red-600',
      testId: 'kpi-sla-compliance'
    },
    {
      title: 'Overdue Tickets',
      value: analytics.overdueTickets.toString(),
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      trend: '-8',
      trendIcon: TrendingDown,
      trendColor: 'text-green-600',
      testId: 'kpi-overdue-tickets'
    },
    {
      title: 'Avg Resolution Time',
      value: `${(analytics.avgResolutionTime || 0).toFixed(1)}d`,
      icon: CheckCircle,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      trend: '-0.2d',
      trendIcon: TrendingDown,
      trendColor: 'text-green-600',
      testId: 'kpi-avg-resolution'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi) => {
        const IconComponent = kpi.icon;
        const TrendIconComponent = kpi.trendIcon;

        return (
          <Card key={kpi.title} className="hover:shadow-md transition-shadow" data-testid={kpi.testId}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600" data-testid={`${kpi.testId}-title`}>
                    {kpi.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1" data-testid={`${kpi.testId}-value`}>
                    {kpi.value}
                  </p>
                  <div className={`flex items-center mt-2 text-sm ${kpi.trendColor}`}>
                    <TrendIconComponent className="h-4 w-4 mr-1" />
                    <span data-testid={`${kpi.testId}-trend`}>{kpi.trend}</span>
                    <span className="text-gray-500 ml-1">from last month</span>
                  </div>
                </div>
                <div className={`${kpi.iconBg} p-3 rounded-full`}>
                  <IconComponent className={`h-6 w-6 ${kpi.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
