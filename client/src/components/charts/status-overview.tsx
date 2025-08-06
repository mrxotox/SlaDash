import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  requestTypeData?: StatusStats[];
}

export default function StatusOverview({ statusData, priorityData, requestTypeData = [] }: StatusOverviewProps) {
  const totalStatusTickets = statusData.reduce((sum, status) => sum + status.count, 0);
  const totalPriorityTickets = priorityData.reduce((sum, priority) => sum + priority.count, 0);
  const totalRequestTypeTickets = requestTypeData.reduce((sum, type) => sum + type.count, 0);

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

  const processedRequestType = requestTypeData
    .map(type => ({
      ...type,
      percentage: totalRequestTypeTickets > 0 ? (type.count / totalRequestTypeTickets) * 100 : 0,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950/20'
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${status.color.replace('text-', 'bg-')}`}></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {status.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {status.count}
                  </span>
                  <span className="text-xs text-gray-500 min-w-[40px]">
                    {status.percentage.toFixed(1)}%
                  </span>
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
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${priority.bg}`}></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {priority.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {priority.count}
                </span>
                <span className="text-xs text-gray-500 min-w-[40px]">
                  {priority.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Request Type Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Tipo de Solicitud</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribución por tipo de solicitud ({totalRequestTypeTickets} tickets)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {processedRequestType.slice(0, 5).map((type, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full bg-purple-500`}></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {type.name || 'Sin tipo'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {type.count}
                </span>
                <span className="text-xs text-gray-500 min-w-[40px]">
                  {type.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}