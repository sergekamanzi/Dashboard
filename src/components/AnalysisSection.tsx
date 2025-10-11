import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import type { Report } from '../types';

interface AnalysisSectionProps {
  reports: Report[];
  isAdmin?: boolean;
}

interface RegionCount {
  [key: string]: number;
}

interface IncomeData {
  total: number;
  count: number;
}

interface IncomeConsumption {
  [key: string]: IncomeData;
}

interface ApplianceUsage {
  [key: string]: number;
}

const AnalysisSection = ({ reports, isAdmin = false }: AnalysisSectionProps) => {
  const getRegionData = () => {
    const regionCounts: RegionCount = {};
    reports.forEach(report => {
      const region = report.householdData?.region || 'Unknown';
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    });

    return Object.entries(regionCounts).map(([name, value]) => ({ name, value }));
  };

  const getIncomeData = () => {
    const incomeConsumption: IncomeConsumption = {};
    reports.forEach(report => {
      const income = report.householdData?.incomeLevel || 'Unknown';
      if (!incomeConsumption[income]) {
        incomeConsumption[income] = { total: 0, count: 0 };
      }
      incomeConsumption[income].total += parseFloat(String(report.consumption));
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
      consumption: parseFloat(String(report.consumption)),
      bill: parseFloat(String(report.bill))
    }));
  };

  const getTariffDistribution = () => {
    const tariffCounts: RegionCount = {};
    reports.forEach(report => {
      const tariff = report.tariffBracket || 'Unknown';
      tariffCounts[tariff] = (tariffCounts[tariff] || 0) + 1;
    });

    return Object.entries(tariffCounts).map(([name, value]) => ({ name, value }));
  };

  const getApplianceUsageData = () => {
    const applianceUsage: ApplianceUsage = {};
    
    reports.forEach(report => {
      if (report.appliances && Array.isArray(report.appliances)) {
        report.appliances.forEach(appliance => {
          const applianceName = appliance.name || 'Unknown Appliance';
          applianceUsage[applianceName] = (applianceUsage[applianceName] || 0) + 1;
        });
      }
    });

    // Sort by usage count (most to least)
    return Object.entries(applianceUsage)
      .map(([name, count]) => ({ 
        name, 
        count,
        percentage: ((count / reports.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
  };

  const COLORS = ['#00FF7F', '#FF8C00', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFD700', '#9370DB', '#20B2AA', '#FF69B4', '#00CED1'];

  const regionData = getRegionData();
  const incomeData = getIncomeData();
  const trendData = getConsumptionTrend();
  const tariffData = getTariffDistribution();
  const applianceUsageData = getApplianceUsageData();

  const totalConsumption = reports.reduce((sum, r) => sum + parseFloat(String(r.consumption)), 0);
  const avgConsumption = reports.length > 0 ? (totalConsumption / reports.length).toFixed(2) : 0;
  const totalBill = reports.reduce((sum, r) => sum + parseFloat(String(r.bill)), 0);
  const avgBill = reports.length > 0 ? (totalBill / reports.length).toFixed(2) : 0;
  const averageHouseholdSizeValue = reports.length > 0
    ? reports.reduce((sum, r) => {
        const size = r.householdData?.householdSize;
        const numericSize = typeof size === 'number' ? size : Number(size ?? 0);
        return sum + (Number.isNaN(numericSize) ? 0 : numericSize);
      }, 0) / reports.length
    : null;

  return (
    <div className="space-y-6 ">
      <div>
        <h1 className="text-3xl font-bold text-orange-500">Energy Analysis</h1>
  <p className="text-black mt-2">Statistical insights and visualizations</p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border-2 border-green-500 text-center">
          <p className="text-xl text-black">No reports available for analysis.</p>
          <p className="text-sm text-black mt-2">Generate predictions to see analytics here.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border-2 border-green-500">
              <h3 className="text-sm text-black mb-2">Total Reports</h3>
              <p className="text-3xl font-bold text-green-500">{reports.length}</p>
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-orange-500">
              <h3 className="text-sm text-black mb-2">Avg Consumption</h3>
              <p className="text-3xl font-bold text-orange-500">{avgConsumption} kWh</p>
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-green-500">
              <h3 className="text-sm text-black mb-2">Total Consumption</h3>
              <p className="text-3xl font-bold text-green-500">{totalConsumption.toFixed(2)} kWh</p>
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-orange-500">
              <h3 className="text-sm text-black mb-2">Avg Bill</h3>
              <p className="text-3xl font-bold text-orange-500">{avgBill} RWF</p>
            </div>
          </div>

          {isAdmin ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border-2 border-green-500">
          <h2 className="text-xl font-bold text-green-500 mb-4">Households by Region</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={regionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: PieLabelRenderProps) => {
                        const name = props.name ?? 'Unknown';
                        const rawPercent = typeof props.percent === 'number' ? props.percent : Number(props.percent ?? 0);
                        return `${name}: ${(rawPercent * 100).toFixed(0)}%`;
                      }}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {regionData.map((entry, index) => (
                        <Cell key={entry.name ?? `cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #00FF7F' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg border-2 border-orange-500">
                <h2 className="text-xl font-bold text-orange-500 mb-4">Tariff Bracket Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tariffData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: PieLabelRenderProps) => {
                        const name = props.name ?? 'Unknown';
                        const rawPercent = typeof props.percent === 'number' ? props.percent : Number(props.percent ?? 0);
                        return `${name}: ${(rawPercent * 100).toFixed(0)}%`;
                      }}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {tariffData.map((entry, index) => (
                        <Cell key={entry.name ?? `cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #FF8C00' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Household users don't need region/tariff breakdowns - show appliance focused visualizations instead */}
        <div className="bg-white p-6 rounded-lg border-2 border-green-500">
          <h2 className="text-xl font-bold text-green-500 mb-4">Appliances Usage (You)</h2>
          <p className="text-black text-sm mb-4">Your appliance usage distribution across reports</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={applianceUsageData.slice(0, 10)} layout="vertical" margin={{ left: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis type="number" stroke="#00FF7F" />
                    <YAxis type="category" dataKey="name" stroke="#00FF7F" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a' }} />
                    <Bar dataKey="count" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg border-2 border-orange-500">
                <h2 className="text-xl font-bold text-orange-500 mb-4">Appliance % Share</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={applianceUsageData.slice(0, 8).map(a => ({ name: a.name, value: Number(a.percentage), count: a.count }))} margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#00FF7F" angle={-45} textAnchor="end" interval={0} height={60} />
                    <YAxis stroke="#00FF7F" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a' }} formatter={(val: number | string, name?: string | number) => {
                      const label = String(name ?? '');
                      return [val, label === 'value' ? 'Percentage' : label] as [string | number, string | number];
                    }} />
                    <Bar dataKey="value" fill="#F59E0B" name="% Share" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* New Appliance Usage Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border-2 border-green-500">
      <h2 className="text-xl font-bold text-green-500 mb-4">Most Common Appliances</h2>
      <p className="text-black text-sm mb-4">Appliances used by households (most to least common)</p>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={applianceUsageData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis type="number" stroke="#00FF7F" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#00FF7F"
                    width={90}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #00FF7F' }}
                    formatter={(value: number | string, name?: string | number) => {
                      const key = String(name ?? '');
                      if (key === 'count') return [`${value} households`, 'Usage Count'] as [string, string];
                      return [value, key] as [string | number, string | number];
                    }}
                    labelFormatter={(label) => `Appliance: ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    name="Number of Households"
                    fill="#FF8C00"
                    radius={[0, 4, 4, 0]}
                  >
                    {applianceUsageData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

              <div className="bg-white p-6 rounded-lg border-2 border-orange-500">
                <h2 className="text-xl font-bold text-orange-500 mb-4">Appliance Usage Distribution</h2>
                <p className="text-black text-sm mb-4">Count of households using each appliance (top 8)</p>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={applianceUsageData.slice(0, 8).map(a => ({ name: a.name, count: a.count, pct: Number(a.percentage) }))} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#00FF7F" angle={-45} textAnchor="end" interval={0} height={80} />
                    <YAxis stroke="#00FF7F" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #FF8C00' }} formatter={(val: number | string, key?: string | number) => [val, String(key ?? '')] as [string | number, string]} />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Household Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
          </div>

          {isAdmin && (
            <div className="bg-white p-6 rounded-lg border-2 border-green-500">
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
          )}

          <div className="bg-white p-6 rounded-lg border-2 border-orange-500">
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
            <div className="bg-white p-6 rounded-lg border-2 border-green-500">
              <h2 className="text-xl font-bold text-green-500 mb-4">Key Statistics</h2>
              <div className="space-y-4">
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="text-black">Highest Consumption:</span>
                  <span className="font-bold text-green-500">
                    {Math.max(...reports.map(r => parseFloat(String(r.consumption)))).toFixed(2)} kWh
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="text-black">Lowest Consumption:</span>
                  <span className="font-bold text-green-500">
                    {Math.min(...reports.map(r => parseFloat(String(r.consumption)))).toFixed(2)} kWh
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="text-black">Highest Bill:</span>
                  <span className="font-bold text-orange-500">
                    {Math.max(...reports.map(r => parseFloat(String(r.bill)))).toFixed(2)} RWF
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="text-black">Lowest Bill:</span>
                  <span className="font-bold text-orange-500">
                    {Math.min(...reports.map(r => parseFloat(String(r.bill)))).toFixed(2)} RWF
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="text-black">Most Common Appliance:</span>
                  <span className="font-bold text-green-500">
                    {applianceUsageData[0]?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="text-black">Total Unique Appliances:</span>
                  <span className="font-bold text-orange-500">
                    {applianceUsageData.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg border-2 border-orange-500">
              <h2 className="text-xl font-bold text-orange-500 mb-4">Insights</h2>
              <div className="space-y-3">
                {isAdmin ? (
                  <>
                    <div className="p-4 bg-green-900 border border-green-500 rounded">
                      <p className="text-sm">
                        <strong className="text-green-400">Most Common Region:</strong>{' '}
                        {regionData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-orange-900 border border-orange-500 rounded">
                      <p className="text-sm">
                        <strong className="text-orange-400">Average Household Size:</strong>{' '}
                        {averageHouseholdSizeValue !== null
                          ? averageHouseholdSizeValue.toFixed(1)
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-green-900 border border-green-500 rounded">
                      <p className="text-sm">
                        <strong className="text-green-400">Most Common Tariff:</strong>{' '}
                        {tariffData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-orange-900 border border-orange-500 rounded">
                      <p className="text-sm">
                        <strong className="text-orange-400">Top 3 Appliances:</strong>{' '}
                        {applianceUsageData.slice(0, 3).map(app => app.name).join(', ') || 'N/A'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-green-900 border border-green-500 rounded">
                      <p className="text-sm">
                        <strong className="text-green-400">Top Appliances (You):</strong>{' '}
                        {applianceUsageData.slice(0, 5).map(app => app.name).join(', ') || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-orange-900 border border-orange-500 rounded">
                      <p className="text-sm">
                        <strong className="text-orange-400">Estimated Monthly Bill (avg):</strong>{' '}
                        {reports.length > 0 ? (totalBill / reports.length).toFixed(2) : 'N/A'} RWF
                      </p>
                    </div>
                    <div className="p-4 bg-green-900 border border-green-500 rounded">
                      <p className="text-sm">
                        <strong className="text-green-400">Most Expensive Appliance:</strong>{' '}
                        {(() => {
                          // Find appliance with highest average bill share
                          const applianceBills: Record<string, number[]> = {};
                          reports.forEach(r => {
                            r.appliances?.forEach(a => {
                              applianceBills[a.name] = applianceBills[a.name] || [];
                              applianceBills[a.name].push(parseFloat(String(a.bill)));
                            });
                          });
                          const averages = Object.entries(applianceBills).map(([name, arr]) => ({ name, avg: arr.reduce((s, v) => s + v, 0) / arr.length }));
                          return averages.sort((a, b) => b.avg - a.avg)[0]?.name || 'N/A';
                        })()}
                      </p>
                    </div>
                    <div className="p-4 bg-orange-900 border border-orange-500 rounded">
                      <p className="text-sm">
                        <strong className="text-orange-400">Unique Appliances you use:</strong>{' '}
                        {applianceUsageData.length}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalysisSection;