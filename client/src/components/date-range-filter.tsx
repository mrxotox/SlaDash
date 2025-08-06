import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Filter, RotateCcw } from 'lucide-react';

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: string | null, endDate: string | null) => void;
  isActive: boolean;
}

export default function DateRangeFilter({ onDateRangeChange, isActive }: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleApplyFilter = () => {
    const start = startDate ? startDate : null;
    const end = endDate ? endDate : null;
    onDateRangeChange(start, end);
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    onDateRangeChange(null, null);
  };

  // Get current date for max attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-primary" />
          <span>Filtro de Rango de Fechas</span>
          {isActive && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Activo
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            {isActive ? (
              <div>
                <p className="font-medium">Filtro activo:</p>
                <p>
                  {startDate || 'Sin inicio'} - {endDate || 'Sin fin'}
                </p>
              </div>
            ) : (
              <p>Sin filtro aplicado</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="start-date">Fecha Inicio</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || today}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">Fecha Fin</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={today}
                className="w-full"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleApplyFilter}
                className="flex items-center space-x-1"
                disabled={!startDate && !endDate}
              >
                <Filter className="h-4 w-4" />
                <span>Aplicar</span>
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleClearFilter}
                className="flex items-center space-x-1"
                disabled={!isActive}
              >
                <RotateCcw className="h-4 w-4" />
                <span>Limpiar</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}