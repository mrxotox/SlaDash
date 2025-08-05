import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardData, TicketFilters } from '@/types/ticket';
import Sidebar from '@/components/sidebar';
import UploadSection from '@/components/upload-section';
import ModernKPICards from '@/components/modern-kpi-cards';
import FilterControls from '@/components/filter-controls';
import StatusOverview from '@/components/charts/status-overview';
import SLADashboard from '@/components/charts/sla-dashboard';
import DepartmentAnalytics from '@/components/charts/department-analytics';
import TechnicianPerformance from '@/components/charts/technician-performance';
import RecentTickets from '@/components/recent-tickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, BarChart3, Users, Target, Building2 } from 'lucide-react';

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
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  <BarChart3 className="inline-block h-8 w-8 mr-3 text-primary" />
                  Análisis Departamental
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Distribución detallada por categorías y departamentos
                </p>
              </div>
            </div>
            
            <FilterControls
              onFiltersChange={handleFiltersChange}
              categoryStats={dashboardData.categoryStats}
              technicianStats={dashboardData.technicianStats}
            />

            <DepartmentAnalytics 
              categoryStats={dashboardData.categoryStats}
              technicianStats={dashboardData.technicianStats}
            />

            <StatusOverview 
              statusData={dashboardData.statusStats}
              priorityData={dashboardData.priorityStats}
            />
          </div>
        );

      case 'technicians':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  <Users className="inline-block h-8 w-8 mr-3 text-primary" />
                  Rendimiento de Técnicos
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Métricas individuales y análisis de desempeño
                </p>
              </div>
            </div>
            
            <TechnicianPerformance data={dashboardData.technicianStats} />
          </div>
        );

      case 'sla':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  <Target className="inline-block h-8 w-8 mr-3 text-primary" />
                  Reportes SLA
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Cumplimiento de Acuerdos de Nivel de Servicio
                </p>
              </div>
            </div>
            
            <SLADashboard 
              analytics={dashboardData.analytics}
              technicianStats={dashboardData.technicianStats}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Mesa de Ayuda TI - Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Monitoreo en tiempo real del rendimiento y cumplimiento SLA
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Datos actualizados</span>
              </div>
            </div>

            {/* Modern KPI Cards */}
            <ModernKPICards 
              analytics={dashboardData.analytics}
              technicianStats={dashboardData.technicianStats}
              statusStats={dashboardData.statusStats}
              priorityStats={dashboardData.priorityStats}
            />

            {/* Status and Priority Overview */}
            <StatusOverview 
              statusData={dashboardData.statusStats}
              priorityData={dashboardData.priorityStats}
            />

            {/* SLA Dashboard */}
            <SLADashboard 
              analytics={dashboardData.analytics}
              technicianStats={dashboardData.technicianStats}
            />

            {/* Recent Tickets */}
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
