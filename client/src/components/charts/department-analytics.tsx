import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Ticket, TrendingUp, TrendingDown, Building2, Users, Clock } from 'lucide-react';
import { CategoryStats, TechnicianStats } from '@/types/ticket';

interface DepartmentAnalyticsProps {
  departmentStats: CategoryStats[];
  technicianStats: TechnicianStats[];
}

export default function DepartmentAnalytics({ departmentStats, technicianStats }: DepartmentAnalyticsProps) {
  const totalTickets = departmentStats.reduce((sum, dept) => sum + dept.count, 0);
  const totalTechnicians = technicianStats.length;
  const activeTechnicians = technicianStats.filter(tech => tech.totalTickets > 0).length;
  
  // Organize departments by volume
  const sortedDepartments = [...departmentStats]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8 departments

  // Calculate department metrics
  const departmentMetrics = sortedDepartments.map(dept => {
    const percentage = totalTickets > 0 ? (dept.count / totalTickets) * 100 : 0;
    const ticketsPerTech = activeTechnicians > 0 ? dept.count / activeTechnicians : 0;
    
    return {
      ...dept,
      percentage,
      ticketsPerTech,
      priority: percentage > 20 ? 'high' : percentage > 10 ? 'medium' : 'low'
    };
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return { variant: 'destructive' as const, label: 'Alto Volumen' };
      case 'medium': return { variant: 'secondary' as const, label: 'Medio' };
      default: return { variant: 'outline' as const, label: 'Normal' };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Department Volume Chart */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span>Análisis por Departamento/Categoría</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribución de tickets por área de negocio
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentMetrics.map((dept, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(dept.priority)}`}></div>
                    <div>
                      <h4 className="font-semibold text-sm">{dept.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {dept.count} tickets • {dept.percentage.toFixed(1)}% del total
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge {...getPriorityBadge(dept.priority)}>
                      {getPriorityBadge(dept.priority).label}
                    </Badge>
                    <span className="text-lg font-bold">{dept.count}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Volumen relativo</span>
                    <span className="font-medium">{dept.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={dept.percentage} className="h-2" />
                  
                  <div className="grid grid-cols-3 gap-4 pt-2 text-center">
                    <div>
                      <p className="text-lg font-semibold text-primary">{dept.count}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-orange-600">
                        {dept.ticketsPerTech.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">Por técnico</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-blue-600">
                        {dept.percentage.toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground">% Total</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Resumen de Recursos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Ticket className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{totalTickets}</p>
              <p className="text-xs text-muted-foreground">Total Tickets</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{activeTechnicians}</p>
              <p className="text-xs text-muted-foreground">Técnicos Activos</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Distribución de Carga</span>
              <span className="text-sm text-muted-foreground">
                {(totalTickets / Math.max(activeTechnicians, 1)).toFixed(1)} tickets/técnico
              </span>
            </div>
            <Progress 
              value={(activeTechnicians / Math.max(totalTechnicians, 1)) * 100} 
              className="h-2" 
            />
            <p className="text-xs text-muted-foreground">
              {activeTechnicians} de {totalTechnicians} técnicos con tickets asignados
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Top Departamentos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {departmentMetrics.slice(0, 5).map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                  <span className="text-sm font-medium truncate">{dept.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">{dept.count}</span>
                  <div className="flex items-center">
                    {dept.percentage > 15 ? (
                      <TrendingUp className="h-3 w-3 text-red-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-blue-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}