import { TechnicianStats } from '@/types/ticket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Users } from 'lucide-react';

interface SLATableProps {
  data: TechnicianStats[];
}

export default function SLATable({ data }: SLATableProps) {
  // Sort by SLA compliance descending
  const sortedData = [...data].sort((a, b) => b.slaCompliance - a.slaCompliance);

  const getSLABadgeVariant = (sla: number) => {
    if (sla >= 95) return 'default'; // Green
    if (sla >= 90) return 'secondary'; // Yellow
    return 'destructive'; // Red
  };

  const handleExportReport = () => {
    // Create CSV content
    const headers = ['Technician', 'Total Tickets', 'On Time', 'Overdue', 'SLA Compliance'];
    const csvContent = [
      headers.join(','),
      ...sortedData.map(tech => [
        tech.name,
        tech.totalTickets,
        tech.onTimeTickets,
        tech.overdueTickets,
        `${tech.slaCompliance.toFixed(1)}%`
      ].join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sla-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span data-testid="sla-table-title">SLA Performance by Technician</span>
          </CardTitle>
          <Button onClick={handleExportReport} variant="outline" data-testid="button-export-sla">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto" data-testid="sla-table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead data-testid="table-header-technician">Technician</TableHead>
                <TableHead data-testid="table-header-total">Total Tickets</TableHead>
                <TableHead data-testid="table-header-ontime">On Time</TableHead>
                <TableHead data-testid="table-header-overdue">Overdue</TableHead>
                <TableHead data-testid="table-header-sla">SLA Compliance</TableHead>
                <TableHead data-testid="table-header-performance">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((tech, index) => (
                <TableRow key={tech.name} className="hover:bg-gray-50" data-testid={`sla-row-${index}`}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {tech.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium" data-testid={`technician-name-${index}`}>
                        {tech.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell data-testid={`total-tickets-${index}`}>
                    {tech.totalTickets}
                  </TableCell>
                  <TableCell className="text-green-600" data-testid={`ontime-tickets-${index}`}>
                    {tech.onTimeTickets}
                  </TableCell>
                  <TableCell className="text-red-600" data-testid={`overdue-tickets-${index}`}>
                    {tech.overdueTickets}
                  </TableCell>
                  <TableCell data-testid={`sla-compliance-${index}`}>
                    <Badge variant={getSLABadgeVariant(tech.slaCompliance)}>
                      {tech.slaCompliance.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell data-testid={`performance-indicator-${index}`}>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          tech.slaCompliance >= 95
                            ? 'bg-green-500'
                            : tech.slaCompliance >= 90
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(tech.slaCompliance, 100)}%` }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
