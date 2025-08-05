import { DashboardAnalytics, TechnicianStats, StatusStats, PriorityStats } from '@/types/ticket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Timer,
  Target,
  BarChart3,
  Activity
} from 'lucide-react';

interface ModernKPICardsProps {
  analytics: DashboardAnalytics;
  technicianStats: TechnicianStats[];
  statusStats: StatusStats[];
  priorityStats: PriorityStats[];
}

export default function ModernKPICards({ 
  analytics, 
  technicianStats, 
  statusStats, 
  priorityStats 
}: ModernKPICardsProps) {
  const slaCompliance = analytics.slaCompliance || 0;
  const totalTickets = analytics.totalTickets || 0;
  const closedTickets = analytics.closedTickets || 0;
  const overdueTickets = analytics.overdueTickets || 0;
  const avgResolutionTime = analytics.avgResolutionTime || 0;
  
  const resolutionRate = totalTickets > 0 ? ((closedTickets / totalTickets) * 100) : 0;
  const activeTickets = totalTickets - closedTickets;
  const activeTechnicians = technicianStats.filter(tech => tech.totalTickets > 0).length;
  
  // Critical tickets (Alta y Crítica/Urgente)
  const criticalTickets = priorityStats
    .filter(p => ['alta', 'crítica', 'urgente', 'critical', 'high'].some(priority => 
      p.name.toLowerCase().includes(priority)
    ))
    .reduce((sum, stat) => sum + stat.count, 0);
  
  // Open tickets
  const openTickets = statusStats
    .filter(s => !['closed', 'resolved', 'cerrado', 'resuelto'].some(status => 
      s.name.toLowerCase().includes(status)
    ))
    .reduce((sum, stat) => sum + stat.count, 0);

  const kpis = [
    {
      title: 'Mesa de Ayuda - Resumen',
      subtitle: 'Estado general del servicio',
      value: totalTickets.toLocaleString(),
      label: 'Total Tickets',
      icon: Activity,
      trend: activeTickets > 0 ? `${activeTickets} activos` : 'Todo resuelto',
      trendUp: activeTickets === 0,
      progress: resolutionRate,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-white',
      stats: [
        { label: 'Activos', value: activeTickets, color: 'text-blue-100' },
        { label: 'Resueltos', value: closedTickets, color: 'text-green-100' }
      ]
    },
    {
      title: 'Cumplimiento SLA',
      subtitle: 'Nivel de servicio actual',
      value: `${slaCompliance.toFixed(1)}%`,
      label: 'Meta: 95%',
      icon: Target,
      trend: slaCompliance >= 95 ? 'Excelente' : slaCompliance >= 85 ? 'Bueno' : 'Crítico',
      trendUp: slaCompliance >= 90,
      progress: Math.min(slaCompliance, 100),
      color: slaCompliance >= 95 ? 'bg-gradient-to-br from-green-500 to-green-600' :
             slaCompliance >= 85 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
             'bg-gradient-to-br from-red-500 to-red-600',
      textColor: 'text-white',
      stats: [
        { label: 'A tiempo', value: totalTickets - overdueTickets, color: 'text-green-100' },
        { label: 'Vencidos', value: overdueTickets, color: 'text-red-100' }
      ]
    },
    {
      title: 'Tiempo Resolución',
      subtitle: 'Eficiencia del equipo',
      value: `${avgResolutionTime.toFixed(1)}`,
      label: 'días promedio',
      icon: Timer,
      trend: avgResolutionTime <= 3 ? 'Excelente' : avgResolutionTime <= 5 ? 'Bueno' : 'Lento',
      trendUp: avgResolutionTime <= 3,
      progress: Math.max(0, 100 - (avgResolutionTime * 20)),
      color: avgResolutionTime <= 3 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
             avgResolutionTime <= 5 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
             'bg-gradient-to-br from-orange-500 to-orange-600',
      textColor: 'text-white',
      stats: [
        { label: 'Meta', value: '≤3 días', color: 'text-emerald-100' },
        { label: 'Actual', value: `${avgResolutionTime.toFixed(1)}d`, color: 'text-white' }
      ]
    },
    {
      title: 'Equipo Técnico',
      subtitle: 'Recursos disponibles',
      value: activeTechnicians.toString(),
      label: 'técnicos activos',
      icon: Users,
      trend: `${technicianStats.length} total`,
      trendUp: activeTechnicians >= 3,
      progress: (activeTechnicians / Math.max(technicianStats.length, 1)) * 100,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      textColor: 'text-white',
      stats: [
        { label: 'Activos', value: activeTechnicians, color: 'text-purple-100' },
        { label: 'Carga Prom.', value: `${Math.round(totalTickets / Math.max(activeTechnicians, 1))}`, color: 'text-white' }
      ]
    }
  ];

  const alertCards = [
    {
      title: 'Tickets Críticos',
      value: criticalTickets,
      subtitle: 'Prioridad Alta/Crítica',
      icon: AlertTriangle,
      color: criticalTickets > 5 ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
      iconColor: criticalTickets > 5 ? 'text-red-600' : 'text-yellow-600'
    },
    {
      title: 'Tickets Abiertos',
      value: openTickets,
      subtitle: 'Requieren atención',
      icon: Ticket,
      color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Tickets Vencidos',
      value: overdueTickets,
      subtitle: 'Fuera de SLA',
      icon: Clock,
      color: overdueTickets > 0 ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-green-500 bg-green-50 dark:bg-green-950/20',
      iconColor: overdueTickets > 0 ? 'text-red-600' : 'text-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="overflow-hidden">
            <div className={`${kpi.color} ${kpi.textColor} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <kpi.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm opacity-90">{kpi.title}</h3>
                    <p className="text-xs opacity-75">{kpi.subtitle}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {kpi.trendUp ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {kpi.trend}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold">{kpi.value}</span>
                  <span className="text-sm opacity-75">{kpi.label}</span>
                </div>
                
                {kpi.progress !== null && (
                  <div className="space-y-1">
                    <Progress value={kpi.progress} className="h-2 bg-white/20" />
                    <p className="text-xs opacity-75">{kpi.progress.toFixed(1)}% completado</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2">
                  {kpi.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="text-center">
                      <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs opacity-75">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alertCards.map((card, index) => (
          <Card key={index} className={`border-l-4 ${card.color}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{card.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{card.subtitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${card.iconColor}`}>{card.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}