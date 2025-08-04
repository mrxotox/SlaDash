import { useState } from 'react';
import { Ticket } from '@/types/ticket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw, List } from 'lucide-react';
import { getPriorityColor, getStatusColor } from '@/utils/analytics';
import { format } from 'date-fns';

interface RecentTicketsProps {
  tickets: Ticket[];
}

export default function RecentTickets({ tickets }: RecentTicketsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter tickets based on search term
  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.technician?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.requestId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate filtered tickets
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchReset = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return format(new Date(date), 'MMM d, yyyy');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center space-x-2">
            <List className="h-5 w-5 text-primary" />
            <span data-testid="recent-tickets-title">Recent Tickets</span>
          </CardTitle>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 w-64"
                data-testid="search-tickets"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSearchReset}
              data-testid="button-reset-search"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto" data-testid="recent-tickets-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead data-testid="table-header-id">ID</TableHead>
                <TableHead data-testid="table-header-subject">Subject</TableHead>
                <TableHead data-testid="table-header-requester">Requester</TableHead>
                <TableHead data-testid="table-header-technician">Technician</TableHead>
                <TableHead data-testid="table-header-status">Status</TableHead>
                <TableHead data-testid="table-header-priority">Priority</TableHead>
                <TableHead data-testid="table-header-due-date">Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTickets.length > 0 ? (
                paginatedTickets.map((ticket, index) => (
                  <TableRow key={ticket.id} className="hover:bg-gray-50" data-testid={`ticket-row-${index}`}>
                    <TableCell className="font-medium text-primary" data-testid={`ticket-id-${index}`}>
                      {ticket.requestId}
                    </TableCell>
                    <TableCell className="max-w-xs" data-testid={`ticket-subject-${index}`}>
                      <div className="truncate" title={ticket.subject}>
                        {ticket.subject}
                      </div>
                    </TableCell>
                    <TableCell data-testid={`ticket-requester-${index}`}>
                      {ticket.requesterName}
                    </TableCell>
                    <TableCell data-testid={`ticket-technician-${index}`}>
                      {ticket.technician || '-'}
                    </TableCell>
                    <TableCell data-testid={`ticket-status-${index}`}>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`ticket-priority-${index}`}>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`ticket-due-date-${index}`}>
                      {formatDate(ticket.dueByDate)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8" data-testid="no-tickets-message">
                    <div className="text-gray-500">
                      {searchTerm ? 'No tickets found matching your search.' : 'No tickets available.'}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {filteredTickets.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700" data-testid="pagination-info">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(startIndex + itemsPerPage, filteredTickets.length)}
              </span>{' '}
              of <span className="font-medium">{filteredTickets.length}</span> results
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                data-testid="button-prev-page"
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    data-testid={`button-page-${pageNumber}`}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                data-testid="button-next-page"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
