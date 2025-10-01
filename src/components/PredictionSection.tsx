import { useState } from 'react';
import { Plus, Trash2, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    monthlyBudget: ''
  });
  const [predictions, setPredictions] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const calculatePredictions = () => {
    if (!householdData.region || !householdData.incomeLevel || !householdData.householdSize || !householdData.monthlyBudget) {
      alert('Please fill in all household details');
      return;
    }

    const totalConsumption = appliances.reduce((total, app) => {
      const dailyKwh = (app.power * app.hours * app.quantity) / 1000;
      const monthlyKwh = dailyKwh * app.usageDays;
      return total + monthlyKwh;
    }, 0);

    let tariffBracket = '0-20 kWh';
    let ratePerKwh = 103;

    if (totalConsumption > 50) {
      tariffBracket = '50+ kWh';
      ratePerKwh = 171;
    } else if (totalConsumption > 20) {
      tariffBracket = '21-50 kWh';
      ratePerKwh = 141;
    }

    const estimatedBill = totalConsumption * ratePerKwh;

    const predictionData = {
      consumption: totalConsumption.toFixed(2),
      bill: estimatedBill.toFixed(2),
      tariffBracket,
      appliances: appliances.map(app => ({
        name: app.name,
        consumption: ((app.power * app.hours * app.quantity * app.usageDays) / 1000).toFixed(2)
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
  };

  const getRecommendations = () => {
    if (!predictions) return [];

    const recommendations = [];
    const consumption = parseFloat(predictions.consumption);

    if (consumption > 100) {
      recommendations.push({
        text: 'High consumption detected! Consider reducing AC usage by 2 hours daily to save ~15 kWh',
        type: 'warning'
      });
    }

    recommendations.push({
      text: 'Switch to LED bulbs to reduce lighting costs by up to 75%',
      type: 'success'
    });

    if (parseFloat(predictions.bill) > parseFloat(householdData.monthlyBudget)) {
      recommendations.push({
        text: 'Budget exceeded! Reduce high-power appliance usage during peak hours',
        type: 'warning'
      });
    }

    return recommendations;
  };

  const chartData = predictions?.appliances || [];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-500 mb-2">Energy Prediction</h1>
          <p className="text-gray-400">Calculate your household energy consumption and costs</p>
        </div>

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
            <h2 className="text-2xl font-bold text-green-500 mb-6">Your Appliances</h2>
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
            disabled={appliances.length === 0}
            className="w-full bg-orange-500 hover:bg-orange-600 cursor-pointer text-black font-bold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Zap size={24} />
            Calculate Prediction
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-500 text-black p-4 rounded-lg font-bold text-center">
            Prediction Generated Successfully! Report saved to Reports section.
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
                      parseFloat(predictions.bill) > parseFloat(householdData.monthlyBudget)
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
              {parseFloat(predictions.bill) > parseFloat(householdData.monthlyBudget) ? (
                <div className="bg-red-500 text-black p-4 rounded-lg font-bold">
                  Warning: Your estimated bill exceeds your budget by{' '}
                  {(parseFloat(predictions.bill) - parseFloat(householdData.monthlyBudget)).toFixed(2)} RWF
                </div>
              ) : (
                <div className="bg-green-500 text-black p-4 rounded-lg font-bold">
                  Great! Your estimated bill is within budget. You can save{' '}
                  {(parseFloat(householdData.monthlyBudget) - parseFloat(predictions.bill)).toFixed(2)} RWF
                </div>
              )}
            </div>

            {/* Chart */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold text-green-500 mb-6">Energy Consumption by Appliance</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
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

            {/* Recommendations */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold text-green-500 mb-6">Smart Recommendations</h2>
              <div className="space-y-4">
                {getRecommendations().map((rec, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg font-medium ${
                      rec.type === 'warning'
                        ? 'bg-orange-500 text-black'
                        : 'bg-green-500 text-black'
                    }`}
                  >
                    {rec.text}
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