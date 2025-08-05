import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Gauge,
  Timer
} from 'lucide-react';
import { DashboardAnalytics, TechnicianStats } from '@/types/ticket';

interface SLADashboardProps {
  analytics: DashboardAnalytics;
  technicianStats: TechnicianStats[];
}

export default function SLADashboard({ analytics, technicianStats }: SLADashboardProps) {
  const slaCompliance = analytics.slaCompliance || 0;
  const totalTickets = analytics.totalTickets || 0;
  const overdueTickets = analytics.overdueTickets || 0;
  const avgResolutionTime = analytics.avgResolutionTime || 0;
  
  const onTimeTickets = totalTickets - overdueTickets;
  const slaTarget = 95;
  const timeTarget = 3; // days
  
  // Calculate SLA health
  const getSLAHealth = (sla: number) => {
    if (sla >= 95) return { 
      status: 'Excelente', 
      color: 'text-green-600', 
      bg: 'bg-green-500', 
      icon: CheckCircle2,
      description: 'Cumpliendo objetivos de SLA'
    };
    if (sla >= 85) return { 
      status: 'Bueno', 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-500', 
      icon: Timer,
      description: 'Cerca del objetivo, requiere atención'
    };
    if (sla >= 70) return { 
      status: 'Regular', 
      color: 'text-orange-600', 
      bg: 'bg-orange-500', 
      icon: Clock,
      description: 'Por debajo del objetivo, acción requerida'
    };
    return { 
      status: 'Crítico', 
      color: 'text-red-600', 
      bg: 'bg-red-500', 
      icon: AlertTriangle,
      description: 'SLA crítico, intervención inmediata'
    };
  };

  const getTimeHealth = (time: number) => {
    if (time <= 3) return { 
      status: 'Excelente', 
      color: 'text-green-600', 
      icon: CheckCircle2 
    };
    if (time <= 5) return { 
      status: 'Bueno', 
      color: 'text-yellow-600', 
      icon: Timer 
    };
    return { 
      status: 'Lento', 
      color: 'text-red-600', 
      icon: AlertTriangle 
    };
  };

  const slaHealth = getSLAHealth(slaCompliance);
  const timeHealth = getTimeHealth(avgResolutionTime);
  const SLAIcon = slaHealth.icon;
  const TimeIcon = timeHealth.icon;

  // SLA Performance by technician
  const technicianSLAStats = technicianStats
    .filter(tech => tech.totalTickets > 0)
    .map(tech => ({
      ...tech,
      performance: getSLAHealth(tech.slaCompliance || 0)
    }))
    .sort((a, b) => (b.slaCompliance || 0) - (a.slaCompliance || 0));

  const topPerformers = technicianSLAStats.filter(tech => (tech.slaCompliance || 0) >= 90);
  const needsImprovement = technicianSLAStats.filter(tech => (tech.slaCompliance || 0) < 80);

  return (
    <div className="space-y-6">
      {/* SLA Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="overflow-hidden">
          <div className={`p-4 ${slaHealth.bg} text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs font-medium">CUMPLIMIENTO SLA</p>
                <p className="text-2xl font-bold">{slaCompliance.toFixed(1)}%</p>
              </div>
              <SLAIcon className="h-8 w-8 text-white/80" />
            </div>
            <div className="mt-2">
              <Progress value={slaCompliance} className="h-2 bg-white/20" />
              <p className="text-white/80 text-xs mt-1">{slaHealth.status}</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs font-medium">TICKETS A TIEMPO</p>
                <p className="text-2xl font-bold text-green-600">{onTimeTickets}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Progress value={(onTimeTickets / Math.max(totalTickets, 1)) * 100} className="h-2" />
              <p className="text-muted-foreground text-xs mt-1">
                {((onTimeTickets / Math.max(totalTickets, 1)) * 100).toFixed(1)}% del total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs font-medium">TICKETS VENCIDOS</p>
                <p className="text-2xl font-bold text-red-600">{overdueTickets}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-2">
              <Progress value={(overdueTickets / Math.max(totalTickets, 1)) * 100} className="h-2" />
              <p className="text-muted-foreground text-xs mt-1">
                {((overdueTickets / Math.max(totalTickets, 1)) * 100).toFixed(1)}% del total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className={`p-4 ${timeHealth.color === 'text-green-600' ? 'bg-green-500' : 
                                 timeHealth.color === 'text-yellow-600' ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs font-medium">TIEMPO PROMEDIO</p>
                <p className="text-2xl font-bold">{avgResolutionTime.toFixed(1)}d</p>
              </div>
              <TimeIcon className="h-8 w-8 text-white/80" />
            </div>
            <div className="mt-2">
              <Progress value={Math.max(0, 100 - (avgResolutionTime * 20))} className="h-2 bg-white/20" />
              <p className="text-white/80 text-xs mt-1">{timeHealth.status}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* SLA Gauge Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gauge className="h-5 w-5 text-primary" />
            <span>Indicador SLA General</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="relative">
              {/* Circular Progress */}
              <div className="w-48 h-48 rounded-full border-8 border-gray-200 dark:border-gray-700 relative">
                <div 
                  className={`absolute inset-0 rounded-full border-8 ${slaHealth.bg} border-transparent transition-all duration-1000 ease-out`}
                  style={{
                    background: `conic-gradient(${slaHealth.bg.includes('green') ? '#10b981' : 
                                                   slaHealth.bg.includes('yellow') ? '#f59e0b' :
                                                   slaHealth.bg.includes('orange') ? '#f97316' : '#ef4444'
                                } ${slaCompliance * 3.6}deg, transparent 0deg)`,
                    mask: 'radial-gradient(circle, transparent 70%, black 70%)'
                  }}
                />
                
                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    {slaCompliance.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">SLA Compliance</p>
                  <Badge variant={slaCompliance >= 95 ? 'default' : slaCompliance >= 85 ? 'secondary' : 'destructive'} className="mt-2">
                    {slaHealth.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-lg font-bold text-green-600">≥95%</p>
              <p className="text-xs text-muted-foreground">Meta Excelente</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <p className="text-lg font-bold text-yellow-600">85-94%</p>
              <p className="text-xs text-muted-foreground">Meta Buena</p>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <p className="text-lg font-bold text-red-600">&lt;85%</p>
              <p className="text-xs text-muted-foreground">Requiere Mejora</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Top Performers SLA</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPerformers.length > 0 ? (
              <div className="space-y-3">
                {topPerformers.slice(0, 5).map((tech, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">{tech.name}</p>
                      <p className="text-xs text-muted-foreground">{tech.totalTickets} tickets</p>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      {(tech.slaCompliance || 0).toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No hay técnicos con SLA ≥90%
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <span>Necesitan Mejora</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {needsImprovement.length > 0 ? (
              <div className="space-y-3">
                {needsImprovement.slice(0, 5).map((tech, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">{tech.name}</p>
                      <p className="text-xs text-muted-foreground">{tech.totalTickets} tickets</p>
                    </div>
                    <Badge variant="destructive">
                      {(tech.slaCompliance || 0).toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                ¡Todos los técnicos tienen SLA ≥80%!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}