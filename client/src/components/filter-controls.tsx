import { useState } from 'react';
import { TicketFilters, CategoryStats, TechnicianStats } from '@/types/ticket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, RotateCcw } from 'lucide-react';

interface FilterControlsProps {
  onFiltersChange: (filters: TicketFilters) => void;
  categoryStats: CategoryStats[];
  technicianStats: TechnicianStats[];
}

export default function FilterControls({ onFiltersChange, categoryStats, technicianStats }: FilterControlsProps) {
  const [filters, setFilters] = useState<TicketFilters>({});

  const handleFilterChange = (key: keyof TicketFilters, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined,
    };
    
    // Handle date range
    if (key === 'dateRange' && value) {
      const days = parseInt(value);
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - days);
      
      newFilters.dateRange = { start, end };
    }
    
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    setFilters({});
    onFiltersChange({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-primary" />
          <span data-testid="filters-title">Filters & Controls</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <Select onValueChange={(value) => handleFilterChange('dateRange', value)} data-testid="filter-date-range">
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <Select onValueChange={(value) => handleFilterChange('category', value)} data-testid="filter-category">
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categoryStats.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    {category.name} ({category.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Technician
            </label>
            <Select onValueChange={(value) => handleFilterChange('technician', value)} data-testid="filter-technician">
              <SelectTrigger>
                <SelectValue placeholder="All Technicians" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Technicians</SelectItem>
                {technicianStats.map((tech) => (
                  <SelectItem key={tech.name} value={tech.name}>
                    {tech.name} ({tech.totalTickets})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <Select onValueChange={(value) => handleFilterChange('priority', value)} data-testid="filter-priority">
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priorities</SelectItem>
                <SelectItem value="Alto">High</SelectItem>
                <SelectItem value="Medio">Medium</SelectItem>
                <SelectItem value="Bajo">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={handleReset} data-testid="button-reset-filters">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
