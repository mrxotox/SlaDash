import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardData, TicketFilters } from '@/types/ticket';
import Sidebar from '@/components/sidebar';
import UploadSection from '@/components/upload-section';
import KPICards from '@/components/kpi-cards';
import FilterControls from '@/components/filter-controls';
import StatusChart from '@/components/charts/status-chart';
import SLATrendChart from '@/components/charts/sla-trend-chart';
import CategoryChart from '@/components/charts/category-chart';
import TechnicianChart from '@/components/charts/technician-chart';
import SLATable from '@/components/sla-table';
import RecentTickets from '@/components/recent-tickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [filters, setFilters] = useState<TicketFilters>({});
  const [activeSection, setActiveSection] = useState('dashboard');

  const { data: dashboardData, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
    refetchInterval: false,
  });

  const handleFiltersChange = (newFilters: TicketFilters) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="ml-64 p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (!dashboardData?.analytics) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2" data-testid="no-data-title">
            No Data Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4" data-testid="no-data-message">
            {dashboardData?.message || "Please upload a CSV file to start analyzing your IT tickets."}
          </p>
          <div className="max-w-md mx-auto">
            <UploadSection />
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'upload':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Upload Data
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Import your ticket data from CSV files
              </p>
            </div>
            <div className="max-w-2xl">
              <UploadSection />
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Detailed analytics and performance metrics
              </p>
            </div>
            
            <FilterControls
              onFiltersChange={handleFiltersChange}
              categoryStats={dashboardData.categoryStats}
              technicianStats={dashboardData.technicianStats}
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <StatusChart data={dashboardData.statusStats} />
              <CategoryChart data={dashboardData.categoryStats} />
              <SLATrendChart slaCompliance={dashboardData.analytics.slaCompliance} />
              <TechnicianChart data={dashboardData.technicianStats} />
            </div>
          </div>
        );

      case 'technicians':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Technician Performance
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Individual technician metrics and performance
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TechnicianChart data={dashboardData.technicianStats} />
              <SLATable data={dashboardData.technicianStats} />
            </div>
          </div>
        );

      case 'sla':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                SLA Reports
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Service Level Agreement compliance and performance
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SLATrendChart slaCompliance={dashboardData.analytics.slaCompliance} />
              <SLATable data={dashboardData.technicianStats} />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Dashboard Overview
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor your helpdesk performance and SLA compliance
              </p>
            </div>

            <KPICards analytics={dashboardData.analytics} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <StatusChart data={dashboardData.statusStats} />
              <SLATrendChart slaCompliance={dashboardData.analytics.slaCompliance} />
            </div>

            <RecentTickets tickets={dashboardData.recentTickets} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="ml-64 p-6">
        {renderContent()}
      </div>
    </div>
  );
}
