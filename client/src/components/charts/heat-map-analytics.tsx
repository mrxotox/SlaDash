import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, AlertTriangle } from 'lucide-react';
import { Ticket } from '@/types/ticket';

interface HeatMapAnalyticsProps {
  tickets: Ticket[];
}

export default function HeatMapAnalytics({ tickets }: HeatMapAnalyticsProps) {
  console.log('[HeatMap] Received tickets:', tickets?.length || 0);
  // Generate hour-day heatmap data
  const getHeatMapData = () => {
    const heatMap: { [key: string]: number } = {};
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Initialize all slots to 0
    days.forEach(day => {
      hours.forEach(hour => {
        heatMap[`${day}-${hour}`] = 0;
      });
    });

    tickets.forEach(ticket => {
      if (!ticket.createdDate) return;
      
      try {
        const date = new Date(ticket.createdDate);
        if (isNaN(date.getTime())) return;
        
        const day = days[date.getDay()];
        const hour = date.getHours();
        
        heatMap[`${day}-${hour}`]++;
      } catch (error) {
        console.warn('Invalid created date:', ticket.createdDate);
      }
    });

    return { heatMap, days, hours };
  };

  // Get aging analysis
  const getAgingAnalysis = () => {
    const now = new Date();
    const aging = {
      veryOld: 0, // > 30 days
      old: 0,     // 15-30 days  
      medium: 0,  // 7-15 days
      recent: 0,  // 1-7 days
      today: 0    // < 1 day
    };

    tickets.filter(t => !t.resolvedTime).forEach(ticket => {
      if (!ticket.createdDate) return;
      
      try {
        const created = new Date(ticket.createdDate);
        if (isNaN(created.getTime())) return;
        
        const daysOld = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysOld > 30) aging.veryOld++;
        else if (daysOld > 15) aging.old++;
        else if (daysOld > 7) aging.medium++;
        else if (daysOld > 1) aging.recent++;
        else aging.today++;
      } catch (error) {
        console.warn('Invalid created date:', ticket.createdDate);
      }
    });

    return aging;
  };

  const { heatMap, days, hours } = getHeatMapData();
  const aging = getAgingAnalysis();

  // Get max value for color intensity
  const maxValue = Math.max(...Object.values(heatMap));

  // Get color intensity based on value
  const getIntensity = (value: number) => {
    if (value === 0) return 'bg-gray-100 dark:bg-gray-800';
    const intensity = Math.ceil((value / maxValue) * 4);
    const colors = [
      'bg-blue-100 dark:bg-blue-900/20',
      'bg-blue-200 dark:bg-blue-800/40', 
      'bg-blue-400 dark:bg-blue-700/60',
      'bg-blue-600 dark:bg-blue-600/80',
      'bg-blue-800 dark:bg-blue-500'
    ];
    return colors[intensity] || colors[0];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heat Map */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Mapa de Calor - Tickets por Hora</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribución de tickets creados por día y hora
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Hours header */}
              <div className="grid gap-1 mb-2" style={{gridTemplateColumns: 'auto repeat(24, minmax(0, 1fr)'}}>
                <div className="text-xs font-medium text-center w-12"></div>
                {hours.map(hour => (
                  <div key={hour} className="text-xs text-center w-6">
                    {hour % 4 === 0 ? hour : ''}
                  </div>
                ))}
              </div>
              
              {/* Heat map rows */}
              {days.map(day => (
                <div key={day} className="grid gap-1 items-center" style={{gridTemplateColumns: 'auto repeat(24, minmax(0, 1fr))'}}>
                  <div className="text-xs font-medium text-right w-12 pr-2">
                    {day}
                  </div>
                  {hours.map(hour => {
                    const value = heatMap[`${day}-${hour}`];
                    return (
                      <div
                        key={`${day}-${hour}`}
                        className={`w-6 h-6 rounded-sm ${getIntensity(value)} flex items-center justify-center cursor-pointer`}
                        title={`${day} ${hour}:00 - ${value} tickets`}
                      >
                        {value > 0 && (
                          <span className="text-xs text-white font-bold">
                            {value > 9 ? '9+' : value}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
              
              {/* Legend */}
              <div className="flex items-center space-x-4 mt-4 text-xs">
                <span>Menos</span>
                <div className="flex space-x-1">
                  <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 rounded-sm"></div>
                  <div className="w-4 h-4 bg-blue-200 dark:bg-blue-900/40 rounded-sm"></div>
                  <div className="w-4 h-4 bg-blue-400 dark:bg-blue-700/60 rounded-sm"></div>
                  <div className="w-4 h-4 bg-blue-600 dark:bg-blue-600/80 rounded-sm"></div>
                  <div className="w-4 h-4 bg-blue-800 dark:bg-blue-500 rounded-sm"></div>
                </div>
                <span>Más</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aging Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span>Análisis de Envejecimiento</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Tickets abiertos por antigüedad
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">
                      Muy Antiguos
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-300">
                      Más de 30 días
                    </p>
                  </div>
                </div>
                <Badge variant="destructive" className="text-lg font-bold">
                  {aging.veryOld}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border-l-4 border-orange-500">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      Antiguos
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-300">
                      15-30 días
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  {aging.old}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500">
                <div>
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    Mediano
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-300">
                    7-15 días
                  </p>
                </div>
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  {aging.medium}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500">
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Recientes
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300">
                    1-7 días
                  </p>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  {aging.recent}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500">
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Hoy
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-300">
                    Menos de 1 día
                  </p>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {aging.today}
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-center text-muted-foreground">
                Total tickets abiertos: {aging.veryOld + aging.old + aging.medium + aging.recent + aging.today}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}