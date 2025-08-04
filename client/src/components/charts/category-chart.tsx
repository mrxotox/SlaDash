import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryStats } from '@/types/ticket';
import { Tag, TrendingUp, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CategoryChartProps {
  data: CategoryStats[];
}

const CATEGORY_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#64748b'
];

export default function CategoryChart({ data }: CategoryChartProps) {
  // Filter and sort categories
  const filteredData = data
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Show top 8 categories

  const totalTickets = filteredData.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...filteredData.map(item => item.count));

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="h-5 w-5 text-primary" />
            <span data-testid="category-chart-title">Top Categories</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {totalTickets} tickets • {filteredData.length} categories
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 gap-4">
          {filteredData.map((item, index) => {
            const percentage = ((item.count / totalTickets) * 100).toFixed(1);
            const intensity = (item.count / maxCount) * 100;
            const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
            
            return (
              <div 
                key={index} 
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-800/50 dark:to-transparent"
                data-testid={`category-item-${index}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate" title={item.name}>
                        {item.name || 'Sin categoría'}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {index === 0 && <TrendingUp className="h-4 w-4 text-green-600" />}
                    {item.count > 50 && <AlertCircle className="h-4 w-4 text-orange-500" />}
                    <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {item.count}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Volume</span>
                    <span className="font-medium">{percentage}% of total</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        backgroundColor: color,
                        width: `${intensity}%`,
                        opacity: 0.8
                      }}
                    />
                  </div>
                  
                  {/* Priority indicator based on volume */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Priority Level</span>
                    <Badge 
                      className={`text-xs ${
                        item.count > 50 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        item.count > 20 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      } border-0`}
                    >
                      {item.count > 50 ? 'High' : item.count > 20 ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
