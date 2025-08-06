import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Save, RotateCcw } from 'lucide-react';
import { TicketFilters, CategoryStats, TechnicianStats } from '@/types/ticket';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: TicketFilters & { searchTerm?: string }) => void;
  categoryStats: CategoryStats[];
  technicianStats: TechnicianStats[];
  priorityStats: CategoryStats[];
  statusStats: CategoryStats[];
  requestTypeStats: CategoryStats[];
}

export default function AdvancedFilters({ 
  onFiltersChange, 
  categoryStats, 
  technicianStats, 
  priorityStats, 
  statusStats,
  requestTypeStats
}: AdvancedFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<TicketFilters & { searchTerm?: string }>({});
  const [savedFilters, setSavedFilters] = useState<{ name: string; filters: any }[]>([]);

  // Apply filters whenever they change
  useEffect(() => {
    const filters = { ...selectedFilters };
    if (searchTerm.trim()) {
      filters.searchTerm = searchTerm.trim();
    }
    
    // Always notify parent, even if filters are empty (to clear)
    onFiltersChange(filters);
  }, [selectedFilters, searchTerm, onFiltersChange]);

  const handleFilterChange = (key: keyof TicketFilters, value: string | undefined) => {
    console.log('[AdvancedFilters] Filter change:', key, value);
    if (value === 'all' || !value) {
      const { [key]: removed, ...rest } = selectedFilters;
      setSelectedFilters(rest);
    } else {
      setSelectedFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    setSearchTerm('');
    // Immediately notify parent to clear filters
    onFiltersChange({});
  };

  const saveCurrentFilters = () => {
    if (Object.keys(selectedFilters).length === 0 && !searchTerm) return;
    
    const name = `Filtro ${new Date().toLocaleDateString()}`;
    const newSavedFilter = {
      name,
      filters: { ...selectedFilters, searchTerm }
    };
    
    setSavedFilters(prev => [...prev, newSavedFilter]);
  };

  const applySavedFilter = (filter: any) => {
    setSelectedFilters(filter.filters || {});
    setSearchTerm(filter.filters?.searchTerm || '');
  };

  const getActiveFiltersCount = () => {
    return Object.keys(selectedFilters).length + (searchTerm ? 1 : 0);
  };

  const removeFilter = (key: keyof TicketFilters) => {
    const { [key]: removed, ...rest } = selectedFilters;
    setSelectedFilters(rest);
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
            {(Object.keys(selectedFilters).length > 0 || searchTerm) && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveCurrentFilters}
                  className="flex items-center space-x-1"
                >
                  <Save className="h-4 w-4" />
                  <span>Guardar</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="flex items-center space-x-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Limpiar</span>
                </Button>
              </>
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                {statusStats.map((stat) => (
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
                {technicianStats.map((tech) => (
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
                {categoryStats.map((cat) => (
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
                {priorityStats.map((priority) => (
                  <SelectItem key={priority.name} value={priority.name}>
                    {priority.name} ({priority.count})
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
                {requestTypeStats.map((type) => (
                  <SelectItem key={type.name} value={type.name}>
                    {type.name} ({type.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department Filter */}
          <div className="space-y-2">
            <Label>Departamento</Label>
            <Select 
              value={selectedFilters.department || 'all'} 
              onValueChange={(value) => handleFilterChange('department', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {/* Add department options if available */}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {getActiveFiltersCount() > 0 && (
          <div className="space-y-2">
            <Label>Filtros Activos:</Label>
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <span>Búsqueda: "{searchTerm}"</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSearchTerm('')}
                  />
                </Badge>
              )}
              {Object.entries(selectedFilters).map(([key, value]) => (
                <Badge key={key} variant="outline" className="flex items-center space-x-1">
                  <span>{key}: {value}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter(key as keyof TicketFilters)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Saved Filters */}
        {savedFilters.length > 0 && (
          <div className="space-y-2">
            <Label>Filtros Guardados:</Label>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map((filter, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => applySavedFilter(filter)}
                  className="flex items-center space-x-1"
                >
                  <span>{filter.name}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}