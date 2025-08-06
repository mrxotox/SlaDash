import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Save, RotateCcw } from 'lucide-react';
import { TicketFilters, CategoryStats, TechnicianStats } from '@/types/ticket';

interface PersistentFiltersProps {
  onFiltersChange: (filters: TicketFilters & { searchTerm?: string }) => void;
  categoryStats: CategoryStats[];
  technicianStats: TechnicianStats[];
  priorityStats: CategoryStats[];
  statusStats: CategoryStats[];
  requestTypeStats: CategoryStats[];
  currentFilters: TicketFilters & { searchTerm?: string };
}

export default function PersistentFilters({ 
  onFiltersChange, 
  categoryStats, 
  technicianStats, 
  priorityStats, 
  statusStats,
  requestTypeStats,
  currentFilters
}: PersistentFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(currentFilters.searchTerm || '');

  // Use current filters as controlled state
  const selectedFilters = currentFilters;

  useEffect(() => {
    setSearchTerm(currentFilters.searchTerm || '');
  }, [currentFilters.searchTerm]);

  const handleFilterChange = (key: keyof TicketFilters, value: string | undefined) => {
    console.log('[PersistentFilters] Filter change:', key, value);
    const newFilters = { ...currentFilters };
    
    if (value === 'all' || !value) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const newFilters = { ...currentFilters };
    if (value.trim()) {
      newFilters.searchTerm = value.trim();
    } else {
      delete newFilters.searchTerm;
    }
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    const filterCount = Object.keys(currentFilters).filter(key => key !== 'searchTerm').length;
    return filterCount + (currentFilters.searchTerm ? 1 : 0);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-primary" />
            <span>Filtros Avanzados</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} activos
              </Badge>
            )}
          </CardTitle>
          <div className="flex space-x-2">
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="flex items-center space-x-1"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Limpiar</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Búsqueda de Texto</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Buscar en título, descripción, ID..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select 
              value={selectedFilters.status || 'all'} 
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {statusStats?.map((stat) => (
                  <SelectItem key={stat.name} value={stat.name}>
                    {stat.name} ({stat.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Technician Filter */}
          <div className="space-y-2">
            <Label>Técnico</Label>
            <Select 
              value={selectedFilters.technician || 'all'} 
              onValueChange={(value) => handleFilterChange('technician', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {technicianStats?.map((tech) => (
                  <SelectItem key={tech.name} value={tech.name}>
                    {tech.name} ({tech.totalTickets})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select 
              value={selectedFilters.category || 'all'} 
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categoryStats?.map((cat) => (
                  <SelectItem key={cat.name} value={cat.name}>
                    {cat.name} ({cat.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label>Prioridad</Label>
            <Select 
              value={selectedFilters.priority || 'all'} 
              onValueChange={(value) => handleFilterChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {priorityStats?.map((pri) => (
                  <SelectItem key={pri.name} value={pri.name}>
                    {pri.name} ({pri.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Request Type Filter */}
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select 
              value={selectedFilters.requestType || 'all'} 
              onValueChange={(value) => handleFilterChange('requestType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {requestTypeStats?.map((type) => (
                  <SelectItem key={type.name} value={type.name}>
                    {type.name} ({type.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {Object.entries(selectedFilters).map(([key, value]) => {
              if (key === 'searchTerm' || !value) return null;
              return (
                <Badge key={key} variant="secondary" className="flex items-center space-x-1">
                  <span className="capitalize">{key}: {value}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange(key as keyof TicketFilters, undefined)}
                  />
                </Badge>
              );
            })}
            {selectedFilters.searchTerm && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Búsqueda: {selectedFilters.searchTerm}</span>
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleSearchChange('')}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}