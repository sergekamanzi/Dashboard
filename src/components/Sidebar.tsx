import { LayoutGrid, Target, BarChart3, FileText, Settings, LucideIcon } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  role: 'Admin' | 'Household User';
}

const Sidebar = ({ activeSection, setActiveSection, role }: SidebarProps) => {
  const adminMenu: MenuItem[] = [
    { id: 'admin', label: 'Admin', icon: LayoutGrid },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'report', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const householdMenu: MenuItem[] = [
    { id: 'prediction', label: 'Prediction', icon: Target },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'report', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const menuItems = role === 'Admin' ? adminMenu : householdMenu;

  return (
  <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-8 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-green-500">Rwanda Energy</h1>
      <p className="text-black mt-1">Household Predictor</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full px-6 py-4 mb-2 flex items-center space-x-4 rounded-xl transition font-medium text-lg ${
                  isActive
                    ? 'bg-green-100 text-green-600 border border-green-200'
                    : 'text-black hover:bg-gray-100 hover:text-black'
                }`}
            >
              <Icon size={24} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Version Info */}
      <div className="p-6 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-black mb-1">Energy Predictor</p>
          <p className="text-lg font-bold text-orange-500">Analytics</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;