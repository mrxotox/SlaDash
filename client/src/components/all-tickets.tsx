import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import { Ticket } from '@/types/ticket';

interface AllTicketsProps {
  tickets: Ticket[];
}

const ITEMS_PER_PAGE = 20;

export default function AllTickets({ tickets }: AllTicketsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter tickets based on search term
  const filteredTickets = (tickets || []).filter(ticket => 
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.technician?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTickets = filteredTickets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getStatusBadge = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('cerrado') || lowerStatus.includes('closed')) {
      return <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 dark:bg-green-950/20">
        <CheckCircle className="w-3 h-3 mr-1" />
        {status}
      </Badge>;
    }
    if (lowerStatus.includes('abierto') || lowerStatus.includes('open')) {
      return <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50 dark:bg-blue-950/20">
        <Clock className="w-3 h-3 mr-1" />
        {status}
      </Badge>;
    }
    if (lowerStatus.includes('pendiente') || lowerStatus.includes('pending')) {
      return <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20">
        <AlertCircle className="w-3 h-3 mr-1" />
        {status}
      </Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const getUrgencyBadge = (urgency: string | undefined) => {
    if (!urgency) return <Badge variant="outline">-</Badge>;
    
    const lowerUrgency = urgency.toLowerCase();
    if (lowerUrgency.includes('crítica') || lowerUrgency.includes('critical') || lowerUrgency.includes('urgente')) {
      return <Badge variant="destructive">{urgency}</Badge>;
    }
    if (lowerUrgency.includes('alta') || lowerUrgency.includes('high')) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-950/20 dark:text-orange-400">{urgency}</Badge>;
    }
    if (lowerUrgency.includes('media') || lowerUrgency.includes('medium')) {
      return <Badge variant="secondary">{urgency}</Badge>;
    }
    return <Badge variant="outline">{urgency}</Badge>;
  };

  const getSLABadge = (isOverdue: boolean | undefined) => {
    if (isOverdue === undefined) return <Badge variant="outline">-</Badge>;
    
    if (isOverdue) {
      return <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Vencido
      </Badge>;
    } else {
      return <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 dark:bg-green-950/20">
        <CheckCircle className="w-3 h-3 mr-1" />
        En tiempo
      </Badge>;
    }
  };

  const formatDate = (date: Date | null | string) => {
    if (!date) return '-';
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch {
      return '-';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle>Todos los Tickets ({filteredTickets.length} de {tickets?.length || 0})</CardTitle>
          </div>
          
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="pl-10 w-full sm:w-80"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Técnico</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Urgencia</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Fecha Creación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    {searchTerm ? `No se encontraron tickets que coincidan con "${searchTerm}"` : 'No hay tickets disponibles'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTickets.map((ticket, index) => (
                  <TableRow key={ticket.id || index}>
                    <TableCell className="font-mono text-sm">
                      {ticket.requestId}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={ticket.subject}>
                        {ticket.subject}
                      </div>
                    </TableCell>
                    <TableCell>{ticket.requesterName}</TableCell>
                    <TableCell>{ticket.department || '-'}</TableCell>
                    <TableCell>{ticket.technician || 'Sin asignar'}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>{getUrgencyBadge(ticket.urgency)}</TableCell>
                    <TableCell>{getSLABadge(ticket.isOverdue)}</TableCell>
                    <TableCell>{formatDate(ticket.createdDate)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, filteredTickets.length)} de {filteredTickets.length} tickets
            </p>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Página {currentPage} de {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}