import { useState } from 'react';
import { Plus, Trash2, Zap, Loader2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const PredictionSection = ({ onGenerateReport }) => {
  const [appliances, setAppliances] = useState([]);
  const [currentAppliance, setCurrentAppliance] = useState({
    name: '',
    power: '',
    hours: '',
    quantity: 1,
    usageDays: 30
  });
  const [householdData, setHouseholdData] = useState({
    region: '',
    incomeLevel: '',
    householdSize: '',
    monthlyBudget: '',
    totalAppliances: ''
  });
  const [predictions, setPredictions] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);

  // API Configuration
  const API_BASE_URL = 'http://127.0.0.1:8000';

  const addAppliance = () => {
    if (currentAppliance.name && currentAppliance.power && currentAppliance.hours) {
      setAppliances([...appliances, { ...currentAppliance, id: Date.now() }]);
      setCurrentAppliance({
        name: '',
        power: '',
        hours: '',
        quantity: 1,
        usageDays: 30
      });
    }
  };

  const removeAppliance = (id) => {
    setAppliances(appliances.filter(a => a.id !== id));
  };

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      setApiStatus(data);
      return data.model_loaded;
    } catch (err) {
      setApiStatus({ status: 'offline', message: 'Cannot connect to API server' });
      return false;
    }
  };

  const calculatePredictions = async () => {
    if (!householdData.region || !householdData.incomeLevel || !householdData.householdSize || !householdData.monthlyBudget || !householdData.totalAppliances) {
      setError('Please fill in all household details');
      return;
    }

    if (appliances.length === 0) {
      setError('Please add at least one appliance');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check API health first
      await checkApiHealth();

      // Prepare request payload for FastAPI
      const requestPayload = {
        appliances: appliances.map(app => ({
          appliance: app.name,
          power: parseFloat(app.power),
          power_unit: 'W',
          hours: parseFloat(app.hours),
          quantity: parseInt(app.quantity),
          usage_days_monthly: parseInt(app.usageDays)
        })),
        household_info: {
          region: householdData.region,
          income_level: householdData.incomeLevel,
          appliances_count: parseInt(householdData.totalAppliances),
          household_size: parseInt(householdData.householdSize),
          budget: parseFloat(householdData.monthlyBudget)
        }
      };

      // Call FastAPI prediction endpoint
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      // Transform API response to match our UI format
      const predictionData = {
        consumption: result.total_kwh.toFixed(2),
        bill: result.total_bill.toFixed(2),
        tariffBracket: result.tariff_bracket,
        budgetStatus: result.budget_status,
        budgetDifference: result.budget_difference,
        message: result.message,
        appliances: result.breakdown.map(item => ({
          name: item.appliance,
          consumption: item.estimated_kwh.toFixed(2),
          bill: item.estimated_bill.toFixed(2),
          percentage: item.percentage.toFixed(1),
          powerWatts: item.power_watts
        })),
        householdData,
        timestamp: new Date().toISOString()
      };

      setPredictions(predictionData);
      
      if (onGenerateReport) {
        onGenerateReport(predictionData);
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.message || 'Failed to get prediction. Please ensure the API server is running at http://127.0.0.1:8000');
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendations = () => {
    if (!predictions) return [];

    const recommendations = [];
    const consumption = parseFloat(predictions.consumption);
    const isOverBudget = predictions.budgetStatus === 'over_budget';

    if (consumption > 100) {
      recommendations.push({
        text: `High consumption detected (${consumption} kWh)! Consider reducing high-power appliance usage by 2 hours daily to save approximately 15 kWh`,
        type: 'warning',
        icon: '⚡'
      });
    }

    // Find top 3 consuming appliances
    const topConsumers = [...predictions.appliances]
      .sort((a, b) => parseFloat(b.consumption) - parseFloat(a.consumption))
      .slice(0, 3);

    topConsumers.forEach((app, index) => {
      recommendations.push({
        text: `${index + 1}. ${app.name}: ${app.consumption} kWh (${app.percentage}%) - Focus on optimizing this appliance's usage`,
        type: 'info',
        icon: '🔌'
      });
    });

    recommendations.push({
      text: 'Switch to LED bulbs and energy-efficient appliances to reduce lighting and appliance costs by up to 75%',
      type: 'success',
      icon: '💡'
    });

    if (isOverBudget) {
      const overAmount = Math.abs(predictions.budgetDifference).toFixed(2);
      recommendations.push({
        text: `Budget exceeded by ${overAmount} RWF! Reduce high-power appliance usage during peak hours to stay within budget`,
        type: 'warning',
        icon: '💰'
      });
    }

    // Regional insights
    if (householdData.region === 'Kigali') {
      recommendations.push({
        text: '🏙️ Kigali has higher electricity rates - Focus on energy efficiency measures',
        type: 'info',
        icon: '🌍'
      });
    }

    // Income-based recommendations
    if (householdData.incomeLevel === 'High') {
      recommendations.push({
        text: '💎 Consider investing in smart home technology and solar panels for long-term savings',
        type: 'success',
        icon: '☀️'
      });
    }

    return recommendations;
  };

  const chartData = predictions?.appliances || [];
  const pieChartData = predictions?.appliances.map(app => ({
    name: app.name,
    value: parseFloat(app.consumption)
  })) || [];

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-500 mb-2">Energy Prediction</h1>
          <p className="text-gray-400">Calculate your household energy consumption using AI-powered predictions</p>
          
          {/* API Status Indicator */}
          {apiStatus && (
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              apiStatus.status === 'healthy' ? 'bg-green-900 bg-opacity-20 border border-green-500' :
              apiStatus.status === 'degraded' ? 'bg-yellow-900 bg-opacity-20 border border-yellow-500' :
              'bg-red-900 bg-opacity-20 border border-red-500'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                apiStatus.status === 'healthy' ? 'bg-green-500' :
                apiStatus.status === 'degraded' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <span className="text-sm">
                {apiStatus.status === 'healthy' ? '✓ AI Model Active' :
                 apiStatus.status === 'degraded' ? '⚠ Using Fallback Calculation' :
                 '✗ API Offline - Start server: uvicorn main:app --reload'}
              </span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-bold text-red-400">Error</p>
              <p className="text-sm text-gray-300">{error}</p>
            </div>
          </div>
        )}

        {/* Add Appliances Section */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-green-500 mb-2">Add Appliances</h2>
          <p className="text-gray-400 mb-6">Enter details about your household appliances</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Appliance Name</label>
              <input
                type="text"
                placeholder="e.g., Refrigerator"
                value={currentAppliance.name}
                onChange={(e) => setCurrentAppliance({...currentAppliance, name: e.target.value})}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Power (Watts)</label>
              <input
                type="number"
                placeholder="e.g., 150"
                value={currentAppliance.power}
                onChange={(e) => setCurrentAppliance({...currentAppliance, power: e.target.value})}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Usage Hours/Day</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g., 8"
                value={currentAppliance.hours}
                onChange={(e) => setCurrentAppliance({...currentAppliance, hours: e.target.value})}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                placeholder="1"
                value={currentAppliance.quantity}
                onChange={(e) => setCurrentAppliance({...currentAppliance, quantity: parseInt(e.target.value) || 1})}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Usage Days (Monthly)</label>
              <input
                type="number"
                placeholder="30"
                value={currentAppliance.usageDays}
                onChange={(e) => setCurrentAppliance({...currentAppliance, usageDays: parseInt(e.target.value) || 30})}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={addAppliance}
                className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Appliance
              </button>
            </div>
          </div>
        </div>

        {/* Appliances List */}
        {appliances.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <h2 className="text-2xl font-bold text-green-500 mb-6">Your Appliances ({appliances.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-gray-400 font-medium">Name</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Power (W)</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Hours/Day</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Quantity</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Days/Month</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appliances.map((app) => (
                    <tr key={app.id} className="border-b border-gray-800">
                      <td className="p-4">{app.name}</td>
                      <td className="p-4">{app.power}</td>
                      <td className="p-4">{app.hours}</td>
                      <td className="p-4">{app.quantity}</td>
                      <td className="p-4">{app.usageDays}</td>
                      <td className="p-4">
                        <button
                          onClick={() => removeAppliance(app.id)}
                          className="text-red-500 hover:text-red-400 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Household Details Section */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-green-500 mb-2">Household Details</h2>
          <p className="text-gray-400 mb-6">Provide information about your household</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Region</label>
              <select
                value={householdData.region}
                onChange={(e) => setHouseholdData({...householdData, region: e.target.value})}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
              >
                <option value="">Select region</option>
                <option>Kigali</option>
                <option>Eastern</option>
                <option>Western</option>
                <option>Northern</option>
                <option>Southern</option>
                <option>Muhanga</option>
                <option>Nyagatare</option>
                <option>Musanze</option>
                <option>Huye</option>
                <option>Rusizi</option>
                <option>Rubavu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Income Level</label>
              <select
                value={householdData.incomeLevel}
                onChange={(e) => setHouseholdData({...householdData, incomeLevel: e.target.value})}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
              >
                <option value="">Select income level</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Household Size</label>
              <input
                type="number"
                placeholder="e.g., 4"
                value={householdData.householdSize}
                onChange={(e) => setHouseholdData({...householdData, householdSize: e.target.value})}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Total Number of Appliances</label>
              <input
                type="number"
                placeholder="e.g., 8"
                value={householdData.totalAppliances}
                onChange={(e) => setHouseholdData({...householdData, totalAppliances: e.target.value})}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Monthly Budget (RWF)</label>
              <input
                type="number"
                placeholder="e.g., 50000"
                value={householdData.monthlyBudget}
                onChange={(e) => setHouseholdData({...householdData, monthlyBudget: e.target.value})}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          <button
            onClick={calculatePredictions}
            disabled={appliances.length === 0 || isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 cursor-pointer text-black font-bold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Analyzing with AI Model...
              </>
            ) : (
              <>
                <Zap size={24} />
                Calculate Prediction
              </>
            )}
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-500 text-black p-4 rounded-lg font-bold text-center">
            ✓ Prediction Generated Successfully! {predictions?.message}
          </div>
        )}

        {/* Prediction Results */}
        {predictions && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-sm text-gray-400 mb-2">Monthly Consumption</h3>
                <p className="text-4xl font-bold text-green-500">{predictions.consumption}</p>
                <p className="text-gray-400 text-sm mt-1">kWh</p>
              </div>

              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-sm text-gray-400 mb-2">Estimated Bill</h3>
                <p className="text-4xl font-bold text-orange-500">{predictions.bill}</p>
                <p className="text-gray-400 text-sm mt-1">RWF</p>
              </div>

              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-sm text-gray-400 mb-2">Tariff Bracket</h3>
                <p className="text-2xl font-bold text-white mt-2">{predictions.tariffBracket}</p>
              </div>
            </div>

            {/* Budget Analysis */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold text-green-500 mb-6">Budget Analysis</h2>
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-400">Estimated Bill: {predictions.bill} RWF</span>
                  <span className="text-gray-400">Budget: {householdData.monthlyBudget} RWF</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-8 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      predictions.budgetStatus === 'over_budget'
                        ? 'bg-red-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        (parseFloat(predictions.bill) / parseFloat(householdData.monthlyBudget)) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>
              </div>
              {predictions.budgetStatus === 'over_budget' ? (
                <div className="bg-red-500 text-black p-4 rounded-lg font-bold">
                  ⚠️ Warning: Your estimated bill exceeds your budget by {Math.abs(predictions.budgetDifference).toFixed(2)} RWF
                </div>
              ) : (
                <div className="bg-green-500 text-black p-4 rounded-lg font-bold">
                  ✓ Great! Your estimated bill is within budget. You can save {Math.abs(predictions.budgetDifference).toFixed(2)} RWF
                </div>
              )}
            </div>

            {/* Charts Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                <h2 className="text-2xl font-bold text-green-500 mb-6">Consumption by Appliance</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="consumption" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                <h2 className="text-2xl font-bold text-green-500 mb-6">Energy Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Breakdown Table */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold text-green-500 mb-6">Detailed Appliance Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-4 text-gray-400 font-medium">Appliance</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Power (W)</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Consumption (kWh)</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Cost (RWF)</th>
                      <th className="text-left p-4 text-gray-400 font-medium">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.appliances.map((app, index) => (
                      <tr key={index} className="border-b border-gray-800">
                        <td className="p-4 font-medium">{app.name}</td>
                        <td className="p-4">{app.powerWatts.toFixed(0)}</td>
                        <td className="p-4 text-green-400">{app.consumption}</td>
                        <td className="p-4 text-orange-400">{app.bill}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-green-500"
                                style={{ width: `${app.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm">{app.percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Smart Recommendations */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold text-green-500 mb-6">AI-Powered Recommendations</h2>
              <div className="space-y-4">
                {getRecommendations().map((rec, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg font-medium flex items-start gap-3 ${
                      rec.type === 'warning'
                        ? 'bg-orange-900 bg-opacity-20 border border-orange-500'
                        : rec.type === 'info'
                        ? 'bg-blue-900 bg-opacity-20 border border-blue-500'
                        : 'bg-green-900 bg-opacity-20 border border-green-500'
                    }`}
                  >
                    <span className="text-2xl">{rec.icon}</span>
                    <p className={
                      rec.type === 'warning' ? 'text-orange-300' :
                      rec.type === 'info' ? 'text-blue-300' :
                      'text-green-300'
                    }>{rec.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PredictionSection;