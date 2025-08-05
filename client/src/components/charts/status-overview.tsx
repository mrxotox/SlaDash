import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Play, 
  Pause,
  XCircle,
  Activity,
  BarChart3
} from 'lucide-react';
import { StatusStats, PriorityStats } from '@/types/ticket';

interface StatusOverviewProps {
  statusData: StatusStats[];
  priorityData: PriorityStats[];
}

export default function StatusOverview({ statusData, priorityData }: StatusOverviewProps) {
  const totalStatusTickets = statusData.reduce((sum, status) => sum + status.count, 0);
  const totalPriorityTickets = priorityData.reduce((sum, priority) => sum + priority.count, 0);

  // Map status to icons and colors
  const getStatusConfig = (statusName: string) => {
    const lower = statusName.toLowerCase();
    if (lower.includes('open') || lower.includes('abierto') || lower.includes('nuevo')) {
      return { 
        icon: AlertCircle, 
        color: 'text-blue-600', 
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        label: 'Abierto',
        priority: 'high'
      };
    }
    if (lower.includes('progress') || lower.includes('progreso') || lower.includes('asignado') || lower.includes('assigned')) {
      return { 
        icon: Play, 
        color: 'text-orange-600', 
        bg: 'bg-orange-50 dark:bg-orange-950/20',
        label: 'En Progreso',
        priority: 'medium'
      };
    }
    if (lower.includes('pending') || lower.includes('pendiente') || lower.includes('waiting') || lower.includes('espera')) {
      return { 
        icon: Pause, 
        color: 'text-yellow-600', 
        bg: 'bg-yellow-50 dark:bg-yellow-950/20',
        label: 'Pendiente',
        priority: 'medium'
      };
    }
    if (lower.includes('closed') || lower.includes('cerrado') || lower.includes('resolved') || lower.includes('resuelto')) {
      return { 
        icon: CheckCircle2, 
        color: 'text-green-600', 
        bg: 'bg-green-50 dark:bg-green-950/20',
        label: 'Cerrado',
        priority: 'low'
      };
    }
    if (lower.includes('cancel') || lower.includes('reject') || lower.includes('rechazado')) {
      return { 
        icon: XCircle, 
        color: 'text-red-600', 
        bg: 'bg-red-50 dark:bg-red-950/20',
        label: 'Cancelado',
        priority: 'low'
      };
    }
    return { 
      icon: Clock, 
      color: 'text-gray-600', 
      bg: 'bg-gray-50 dark:bg-gray-950/20',
      label: statusName,
      priority: 'medium'
    };
  };

  const getPriorityConfig = (priorityName: string) => {
    const lower = priorityName.toLowerCase();
    if (lower.includes('crítica') || lower.includes('critical') || lower.includes('urgente') || lower.includes('urgent')) {
      return { 
        color: 'text-red-600', 
        bg: 'bg-red-500',
        label: 'Crítica',
        level: 4
      };
    }
    if (lower.includes('alta') || lower.includes('high')) {
      return { 
        color: 'text-orange-600', 
        bg: 'bg-orange-500',
        label: 'Alta',
        level: 3
      };
    }
    if (lower.includes('media') || lower.includes('medium') || lower.includes('normal')) {
      return { 
        color: 'text-yellow-600', 
        bg: 'bg-yellow-500',
        label: 'Media',
        level: 2
      };
    }
    if (lower.includes('baja') || lower.includes('low')) {
      return { 
        color: 'text-blue-600', 
        bg: 'bg-blue-500',
        label: 'Baja',
        level: 1
      };
    }
    return { 
      color: 'text-gray-600', 
      bg: 'bg-gray-500',
      label: priorityName,
      level: 2
    };
  };

  // Process and sort data
  const processedStatus = statusData
    .map(status => ({
      ...status,
      ...getStatusConfig(status.name),
      percentage: totalStatusTickets > 0 ? (status.count / totalStatusTickets) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count);

  const processedPriority = priorityData
    .map(priority => ({
      ...priority,
      ...getPriorityConfig(priority.name),
      percentage: totalPriorityTickets > 0 ? (priority.count / totalPriorityTickets) * 100 : 0
    }))
    .sort((a, b) => b.level - a.level);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Estado de Tickets</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribución actual por estado ({totalStatusTickets} tickets)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {processedStatus.map((status, index) => {
            const StatusIcon = status.icon;
            
            return (
              <div key={index} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${status.bg}`}>
                      <StatusIcon className={`h-4 w-4 ${status.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{status.label}</h4>
                      <p className="text-xs text-muted-foreground">{status.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${status.color}`}>{status.count}</p>
                    <p className="text-xs text-muted-foreground">{status.percentage.toFixed(1)}%</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Progress value={status.percentage} className="h-2" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {status.priority === 'high' ? '🔴 Requiere atención' : 
                       status.priority === 'medium' ? '🟡 En proceso' : 
                       '🟢 Completado'}
                    </span>
                    <span className="font-medium">{status.count} tickets</span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Priority Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Prioridad de Tickets</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribución por nivel de prioridad ({totalPriorityTickets} tickets)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {processedPriority.map((priority, index) => (
            <div key={index} className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${priority.bg}`}></div>
                  <div>
                    <h4 className="font-semibold text-sm">{priority.label}</h4>
                    <p className="text-xs text-muted-foreground">{priority.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${priority.color}`}>{priority.count}</p>
                  <p className="text-xs text-muted-foreground">{priority.percentage.toFixed(1)}%</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <Progress value={priority.percentage} className="h-2" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {priority.level >= 4 ? '⚠️ Atención inmediata' :
                     priority.level >= 3 ? '🔶 Alta prioridad' :
                     priority.level >= 2 ? '🔸 Prioridad normal' :
                     '🔹 Baja prioridad'}
                  </span>
                  <Badge variant={priority.level >= 3 ? 'destructive' : 'outline'}>
                    Nivel {priority.level}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}