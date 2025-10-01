import { Settings, Bell, Database, Palette, Download, Trash2 } from 'lucide-react';
import { useState } from 'react';

const SettingsSection = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    autoSave: true,
    currency: 'Rwandan Franc (RWF)',
    language: 'English',
    budgetAlerts: true,
    highConsumptionWarnings: true,
    weeklyReports: false,
  });

  const ToggleSwitch = ({ checked, onChange }) => (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        checked ? 'bg-green-500' : 'bg-gray-600'
      }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-black rounded-full transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-500 mb-2">Settings</h1>
          <p className="text-gray-400">Manage your dashboard preferences and data</p>
        </div>

        {/* General Settings Section */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="text-green-500" size={28} />
            <h2 className="text-2xl font-bold text-green-500">General Settings</h2>
          </div>
          <p className="text-gray-400 mb-8">Configure your dashboard preferences</p>

          <div className="space-y-6">
            {/* Enable Notifications */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold mb-1">Enable Notifications</p>
                <p className="text-gray-400 text-sm">Receive alerts about energy consumption</p>
              </div>
              <ToggleSwitch
                checked={settings.notifications}
                onChange={() => setSettings({...settings, notifications: !settings.notifications})}
              />
            </div>

            {/* Dark Mode */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold mb-1">Dark Mode</p>
                <p className="text-gray-400 text-sm">Use dark theme for the dashboard</p>
              </div>
              <ToggleSwitch
                checked={settings.darkMode}
                onChange={() => setSettings({...settings, darkMode: !settings.darkMode})}
              />
            </div>

            {/* Auto-Save Reports */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold mb-1">Auto-Save Reports</p>
                <p className="text-gray-400 text-sm">Automatically save prediction reports</p>
              </div>
              <ToggleSwitch
                checked={settings.autoSave}
                onChange={() => setSettings({...settings, autoSave: !settings.autoSave})}
              />
            </div>

            {/* Currency and Language */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <label className="block text-sm font-medium mb-3">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({...settings, currency: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                >
                  <option>Rwandan Franc (RWF)</option>
                  <option>US Dollar (USD)</option>
                  <option>Euro (EUR)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({...settings, language: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                >
                  <option>English</option>
                  <option>Kinyarwanda</option>
                  <option>French</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button className="mt-8 bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-3 rounded-lg transition">
            Save Settings
          </button>
        </div>

        {/* Notification Preferences Section */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="text-orange-500" size={28} />
            <h2 className="text-2xl font-bold text-orange-500">Notification Preferences</h2>
          </div>
          <p className="text-gray-400 mb-8">Choose what notifications you want to receive</p>

          <div className="space-y-6">
            {/* Budget Alerts */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold mb-1">Budget Alerts</p>
                <p className="text-gray-400 text-sm">Alert when bill exceeds budget</p>
              </div>
              <ToggleSwitch
                checked={settings.budgetAlerts}
                onChange={() => setSettings({...settings, budgetAlerts: !settings.budgetAlerts})}
              />
            </div>

            {/* High Consumption Warnings */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold mb-1">High Consumption Warnings</p>
                <p className="text-gray-400 text-sm">Notify about unusual consumption patterns</p>
              </div>
              <ToggleSwitch
                checked={settings.highConsumptionWarnings}
                onChange={() => setSettings({...settings, highConsumptionWarnings: !settings.highConsumptionWarnings})}
              />
            </div>

            {/* Weekly Reports */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold mb-1">Weekly Reports</p>
                <p className="text-gray-400 text-sm">Receive weekly energy summary</p>
              </div>
              <ToggleSwitch
                checked={settings.weeklyReports}
                onChange={() => setSettings({...settings, weeklyReports: !settings.weeklyReports})}
              />
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Database className="text-blue-500" size={28} />
            <h2 className="text-2xl font-bold text-blue-500">Data Management</h2>
          </div>
          <p className="text-gray-400 mb-8">Export or clear your energy data</p>

          <div className="space-y-4">
            {/* Export Data */}
            <div className="flex justify-between items-center p-6 bg-black rounded-lg border border-gray-800">
              <div>
                <p className="text-lg font-semibold mb-1">Export Data</p>
                <p className="text-gray-400 text-sm">Download all your energy reports as JSON</p>
              </div>
              <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 rounded-lg transition border-2 border-green-500">
                <Download size={20} />
                Export
              </button>
            </div>

            {/* Clear All Data */}
            <div className="flex justify-between items-center p-6 bg-black rounded-lg border border-gray-800">
              <div>
                <p className="text-lg font-semibold mb-1">Clear All Data</p>
                <p className="text-gray-400 text-sm">Permanently delete all energy reports</p>
              </div>
              <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg transition border-2 border-red-600">
                <Trash2 size={20} />
                Clear Data
              </button>
            </div>
          </div>
        </div>

        {/* Theme Customization Section */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="text-purple-500" size={28} />
            <h2 className="text-2xl font-bold text-purple-500">Theme Customization</h2>
          </div>
          <p className="text-gray-400 mb-8">Customize the dashboard appearance</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium mb-3">Primary Color</label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-green-500 rounded-lg border-2 border-gray-700"></div>
                <span className="text-gray-400">#00FF7F</span>
              </div>
            </div>

            {/* Secondary Color */}
            <div>
              <label className="block text-sm font-medium mb-3">Secondary Color</label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-orange-500 rounded-lg border-2 border-gray-700"></div>
                <span className="text-gray-400">#FF8C00</span>
              </div>
            </div>

            {/* Background */}
            <div>
              <label className="block text-sm font-medium mb-3">Background</label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-black rounded-lg border-2 border-gray-700"></div>
                <span className="text-gray-400">#000000</span>
              </div>
            </div>
          </div>

          <p className="text-gray-400 text-sm mt-6">
            Theme colors are currently fixed. Custom theme support coming soon.
          </p>
        </div>

        {/* About Section */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold mb-6">About</h2>
          <p className="text-gray-400 mb-6">Rwanda Household Energy Predictor Dashboard</p>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Version</span>
              <span className="text-white font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Updated</span>
              <span className="text-white font-medium">September 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Developer</span>
              <span className="text-white font-medium">Rwanda Energy Team</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;