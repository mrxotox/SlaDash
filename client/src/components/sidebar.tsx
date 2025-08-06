import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  Upload, 
  Settings, 
  FileText,
  TrendingUp,
  Users,
  Clock
} from "lucide-react"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
    },
    {
      id: 'upload',
      label: 'Upload Data',
      icon: Upload,
    },
    {
      id: 'trends',
      label: 'Analytics Avanzadas',
      icon: TrendingUp,
    },
    {
      id: 'heatmap',
      label: 'Visualizaciones',
      icon: Settings,
    },
    {
      id: 'technicians',
      label: 'Technicians',
      icon: Users,
    },
    {
      id: 'sla',
      label: 'SLA Reports',
      icon: Clock,
    },
    {
      id: 'export',
      label: 'Export',
      icon: FileText,
    },
  ]

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen fixed left-0 top-0 z-40">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            IT Dashboard
          </h1>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  activeSection === item.id
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                onClick={() => onSectionChange(item.id)}
                data-testid={`sidebar-${item.id}`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}