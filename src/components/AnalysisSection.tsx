import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalysisSection = ({ reports }) => {
  const getRegionData = () => {
    const regionCounts = {};
    reports.forEach(report => {
      const region = report.householdData?.region || 'Unknown';
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    });

    return Object.entries(regionCounts).map(([name, value]) => ({ name, value }));
  };

  const getIncomeData = () => {
    const incomeConsumption = {};
    reports.forEach(report => {
      const income = report.householdData?.incomeLevel || 'Unknown';
      if (!incomeConsumption[income]) {
        incomeConsumption[income] = { total: 0, count: 0 };
      }
      incomeConsumption[income].total += parseFloat(report.consumption);
      incomeConsumption[income].count += 1;
    });

    return Object.entries(incomeConsumption).map(([name, data]) => ({
      name,
      avgConsumption: (data.total / data.count).toFixed(2)
    }));
  };

  const getConsumptionTrend = () => {
    return reports.map((report, index) => ({
      index: index + 1,
      consumption: parseFloat(report.consumption),
      bill: parseFloat(report.bill)
    }));
  };

  const getTariffDistribution = () => {
    const tariffCounts = {};
    reports.forEach(report => {
      const tariff = report.tariffBracket || 'Unknown';
      tariffCounts[tariff] = (tariffCounts[tariff] || 0) + 1;
    });

    return Object.entries(tariffCounts).map(([name, value]) => ({ name, value }));
  };

  const COLORS = ['#00FF7F', '#FF8C00', '#FF6B6B', '#4ECDC4', '#45B7D1'];

  const regionData = getRegionData();
  const incomeData = getIncomeData();
  const trendData = getConsumptionTrend();
  const tariffData = getTariffDistribution();

  const totalConsumption = reports.reduce((sum, r) => sum + parseFloat(r.consumption), 0);
  const avgConsumption = reports.length > 0 ? (totalConsumption / reports.length).toFixed(2) : 0;
  const totalBill = reports.reduce((sum, r) => sum + parseFloat(r.bill), 0);
  const avgBill = reports.length > 0 ? (totalBill / reports.length).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-orange-500">Energy Analysis</h1>
        <p className="text-gray-400 mt-2">Statistical insights and visualizations</p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-gray-900 p-12 rounded-lg border-2 border-green-500 text-center">
          <p className="text-xl text-gray-400">No reports available for analysis.</p>
          <p className="text-sm text-gray-500 mt-2">Generate predictions to see analytics here.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg border-2 border-green-500">
              <h3 className="text-sm text-gray-400 mb-2">Total Reports</h3>
              <p className="text-3xl font-bold text-green-500">{reports.length}</p>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg border-2 border-orange-500">
              <h3 className="text-sm text-gray-400 mb-2">Avg Consumption</h3>
              <p className="text-3xl font-bold text-orange-500">{avgConsumption} kWh</p>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg border-2 border-green-500">
              <h3 className="text-sm text-gray-400 mb-2">Total Consumption</h3>
              <p className="text-3xl font-bold text-green-500">{totalConsumption.toFixed(2)} kWh</p>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg border-2 border-orange-500">
              <h3 className="text-sm text-gray-400 mb-2">Avg Bill</h3>
              <p className="text-3xl font-bold text-orange-500">{avgBill} RWF</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg border-2 border-green-500">
              <h2 className="text-xl font-bold text-green-500 mb-4">Households by Region</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #00FF7F' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg border-2 border-orange-500">
              <h2 className="text-xl font-bold text-orange-500 mb-4">Tariff Bracket Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tariffData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tariffData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #FF8C00' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border-2 border-green-500">
            <h2 className="text-xl font-bold text-green-500 mb-4">Average Consumption by Income Level</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#00FF7F" />
                <YAxis stroke="#00FF7F" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #00FF7F' }} />
                <Legend />
                <Bar dataKey="avgConsumption" fill="#FF8C00" name="Avg Consumption (kWh)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border-2 border-orange-500">
            <h2 className="text-xl font-bold text-orange-500 mb-4">Consumption & Bill Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="index" stroke="#FF8C00" label={{ value: 'Report #', position: 'insideBottom', offset: -5 }} />
                <YAxis yAxisId="left" stroke="#00FF7F" label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#FF8C00" label={{ value: 'RWF', angle: 90, position: 'insideRight' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #FF8C00' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="consumption" stroke="#00FF7F" strokeWidth={2} name="Consumption (kWh)" />
                <Line yAxisId="right" type="monotone" dataKey="bill" stroke="#FF8C00" strokeWidth={2} name="Bill (RWF)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg border-2 border-green-500">
              <h2 className="text-xl font-bold text-green-500 mb-4">Key Statistics</h2>
              <div className="space-y-4">
                <div className="flex justify-between p-3 bg-gray-800 rounded">
                  <span className="text-gray-400">Highest Consumption:</span>
                  <span className="font-bold text-green-500">
                    {Math.max(...reports.map(r => parseFloat(r.consumption))).toFixed(2)} kWh
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-gray-800 rounded">
                  <span className="text-gray-400">Lowest Consumption:</span>
                  <span className="font-bold text-green-500">
                    {Math.min(...reports.map(r => parseFloat(r.consumption))).toFixed(2)} kWh
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-gray-800 rounded">
                  <span className="text-gray-400">Highest Bill:</span>
                  <span className="font-bold text-orange-500">
                    {Math.max(...reports.map(r => parseFloat(r.bill))).toFixed(2)} RWF
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-gray-800 rounded">
                  <span className="text-gray-400">Lowest Bill:</span>
                  <span className="font-bold text-orange-500">
                    {Math.min(...reports.map(r => parseFloat(r.bill))).toFixed(2)} RWF
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg border-2 border-orange-500">
              <h2 className="text-xl font-bold text-orange-500 mb-4">Insights</h2>
              <div className="space-y-3">
                <div className="p-4 bg-green-900 border border-green-500 rounded">
                  <p className="text-sm">
                    <strong className="text-green-400">Most Common Region:</strong>{' '}
                    {regionData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
                  </p>
                </div>
                <div className="p-4 bg-orange-900 border border-orange-500 rounded">
                  <p className="text-sm">
                    <strong className="text-orange-400">Average Household Size:</strong>{' '}
                    {reports.length > 0
                      ? (reports.reduce((sum, r) => sum + (r.householdData?.householdSize || 0), 0) / reports.length).toFixed(1)
                      : 'N/A'}
                  </p>
                </div>
                <div className="p-4 bg-green-900 border border-green-500 rounded">
                  <p className="text-sm">
                    <strong className="text-green-400">Most Common Tariff:</strong>{' '}
                    {tariffData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalysisSection;
