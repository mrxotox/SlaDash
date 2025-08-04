import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardData, TicketFilters } from '@/types/ticket';
import FileUpload from '@/components/file-upload';
import KPICards from '@/components/kpi-cards';
import FilterControls from '@/components/filter-controls';
import StatusChart from '@/components/charts/status-chart';
import SLATrendChart from '@/components/charts/sla-trend-chart';
import CategoryChart from '@/components/charts/category-chart';
import TechnicianChart from '@/components/charts/technician-chart';
import SLATable from '@/components/sla-table';
import RecentTickets from '@/components/recent-tickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const [filters, setFilters] = useState<TicketFilters>({});

  const { data: dashboardData, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
    refetchInterval: false,
  });

  const handleFiltersChange = (newFilters: TicketFilters) => {
    setFilters(newFilters);
  };

  const handleFileUploaded = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <BarChart3 className="text-primary text-2xl" />
              <h1 className="text-xl font-semibold text-gray-900" data-testid="header-title">
                IT Support Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                <span data-testid="user-avatar">AD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* File Upload Section */}
        <div className="mb-8">
          <FileUpload onFileUploaded={handleFileUploaded} />
        </div>

        {dashboardData?.analytics ? (
          <>
            {/* KPI Cards */}
            <div className="mb-8">
              <KPICards analytics={dashboardData.analytics} />
            </div>

            {/* Filter Controls */}
            <div className="mb-8">
              <FilterControls 
                onFiltersChange={handleFiltersChange}
                categoryStats={dashboardData.categoryStats}
                technicianStats={dashboardData.technicianStats}
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <StatusChart data={dashboardData.statusStats} />
              <SLATrendChart slaCompliance={dashboardData.analytics.slaCompliance} />
              <CategoryChart data={dashboardData.categoryStats} />
              <TechnicianChart data={dashboardData.technicianStats} />
            </div>

            {/* SLA Performance Table */}
            <div className="mb-8">
              <SLATable data={dashboardData.technicianStats} />
            </div>

            {/* Recent Tickets */}
            <div className="mb-8">
              <RecentTickets tickets={dashboardData.recentTickets} />
            </div>
          </>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2" data-testid="no-data-title">
                No Data Available
              </h3>
              <p className="text-gray-600 mb-4" data-testid="no-data-message">
                {dashboardData?.message || "Please upload a CSV file to start analyzing your IT tickets."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
