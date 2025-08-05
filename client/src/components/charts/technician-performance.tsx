import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Target, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Award,
  Zap,
  Activity
} from 'lucide-react';
import { TechnicianStats } from '@/types/ticket';

interface TechnicianPerformanceProps {
  data: TechnicianStats[];
}

export default function TechnicianPerformance({ data }: TechnicianPerformanceProps) {
  if (!data || !Array.isArray(data)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Rendimiento por Técnico</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay datos de técnicos disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter and sort technicians
  const activeTechnicians = data
    .filter(tech => tech && tech.totalTickets > 0 && typeof tech.slaCompliance === 'number')
    .sort((a, b) => b.totalTickets - a.totalTickets);

  const totalTickets = activeTechnicians.reduce((sum, tech) => sum + tech.totalTickets, 0);
  const avgSLA = activeTechnicians.length > 0 
    ? activeTechnicians.reduce((sum, tech) => sum + (tech.slaCompliance || 0), 0) / activeTechnicians.length 
    : 0;

  const getPerformanceLevel = (sla: number, tickets: number) => {
    if (sla >= 95 && tickets >= 10) return { level: 'Excelente', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/20', icon: Award };
    if (sla >= 90 && tickets >= 5) return { level: 'Muy Bueno', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20', icon: Zap };
    if (sla >= 80) return { level: 'Bueno', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/20', icon: Activity };
    return { level: 'Necesita Mejora', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20', icon: AlertTriangle };
  };

  const getSLAColor = (sla: number) => {
    if (sla >= 95) return 'text-green-600';
    if (sla >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSLABg = (sla: number) => {
    if (sla >= 95) return 'bg-green-500';
    if (sla >= 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeTechnicians.length}</p>
                <p className="text-sm text-muted-foreground">Técnicos Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgSLA.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">SLA Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(totalTickets / Math.max(activeTechnicians.length, 1))}</p>
                <p className="text-sm text-muted-foreground">Tickets/Técnico</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technician Performance Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Rendimiento Individual</span>
            </div>
            <Badge variant="outline">
              {activeTechnicians.length} técnicos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTechnicians.map((tech, index) => {
              const workloadPercentage = ((tech.totalTickets / totalTickets) * 100);
              const performance = getPerformanceLevel(tech.slaCompliance || 0, tech.totalTickets);
              const PerformanceIcon = performance.icon;
              
              return (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className={`p-4 ${performance.bg}`}>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-white text-gray-700 font-semibold">
                            {tech.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate" title={tech.name}>
                            {tech.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {tech.totalTickets} tickets asignados
                          </p>
                        </div>
                        <PerformanceIcon className={`h-5 w-5 ${performance.color}`} />
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="p-4 space-y-4">
                      {/* SLA Compliance */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">SLA Compliance</span>
                          <span className={`text-sm font-bold ${getSLAColor(tech.slaCompliance || 0)}`}>
                            {(tech.slaCompliance || 0).toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(tech.slaCompliance || 0, 100)} 
                          className="h-2"
                        />
                      </div>

                      {/* Workload */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Carga de Trabajo</span>
                          <span className="text-sm font-bold text-blue-600">
                            {workloadPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={workloadPercentage} 
                          className="h-2"
                        />
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-2 bg-green-50 dark:bg-green-950/20 rounded">
                          <div className="flex items-center justify-center space-x-1">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            <span className="text-lg font-bold text-green-600">
                              {tech.onTimeTickets}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">A tiempo</p>
                        </div>
                        <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded">
                          <div className="flex items-center justify-center space-x-1">
                            <Clock className="h-3 w-3 text-red-600" />
                            <span className="text-lg font-bold text-red-600">
                              {tech.overdueTickets}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">Vencidos</p>
                        </div>
                      </div>

                      {/* Performance Badge */}
                      <div className="flex items-center justify-center">
                        <Badge 
                          variant="outline" 
                          className={`${performance.color} border-current`}
                        >
                          {performance.level}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}