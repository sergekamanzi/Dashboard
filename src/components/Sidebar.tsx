import { LayoutGrid, Target, BarChart3, FileText, Settings } from 'lucide-react';

const Sidebar = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'admin', label: 'Admin', icon: LayoutGrid },
    { id: 'prediction', label: 'Prediction', icon: Target },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'report', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-black border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-8 border-b border-gray-800">
        <h1 className="text-3xl font-bold text-green-500">Rwanda Energy</h1>
        <p className="text-gray-400 mt-1">Household Predictor</p>
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
                  ? 'bg-green-900 bg-opacity-40 text-green-500 border border-green-500'
                  : 'text-gray-400 hover:bg-gray-900 hover:text-white'
              }`}
            >
              <Icon size={24} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Version Info */}
      <div className="p-6 border-t border-gray-800">
        <div className="bg-gray-900 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Version</p>
          <p className="text-lg font-bold text-orange-500">v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;