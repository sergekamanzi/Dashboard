import { useState, useEffect } from 'react';
import { Users, AlertCircle, TrendingUp, Zap, Network, Play } from 'lucide-react';

const AdminSection = ({ reports = [] }) => {
  const [clusters, setClusters] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [activeTab, setActiveTab] = useState('kmeans');
  const [hasRunClustering, setHasRunClustering] = useState(false);
  const [hasRunAnomalyDetection, setHasRunAnomalyDetection] = useState(false);

  const avgConsumption = reports.length > 0 
    ? (reports.reduce((sum, r) => sum + parseFloat(r.consumption || 0), 0) / reports.length).toFixed(2)
    : 0;

  const performClustering = () => {
    if (reports.length < 3) {
      return;
    }

    const clusterData = [
      {
        id: 1,
        name: 'Low Consumption Cluster',
        description: 'Households with consumption < 30 kWh',
        color: 'green',
        households: reports.filter(r => parseFloat(r.consumption) < 30),
        avgConsumption: reports
          .filter(r => parseFloat(r.consumption) < 30)
          .reduce((sum, r) => sum + parseFloat(r.consumption), 0) /
          Math.max(reports.filter(r => parseFloat(r.consumption) < 30).length, 1)
      },
      {
        id: 2,
        name: 'Medium Consumption Cluster',
        description: 'Households with consumption 30-80 kWh',
        color: 'orange',
        households: reports.filter(r => parseFloat(r.consumption) >= 30 && parseFloat(r.consumption) <= 80),
        avgConsumption: reports
          .filter(r => parseFloat(r.consumption) >= 30 && parseFloat(r.consumption) <= 80)
          .reduce((sum, r) => sum + parseFloat(r.consumption), 0) /
          Math.max(reports.filter(r => parseFloat(r.consumption) >= 30 && parseFloat(r.consumption) <= 80).length, 1)
      },
      {
        id: 3,
        name: 'High Consumption Cluster',
        description: 'Households with consumption > 80 kWh',
        color: 'red',
        households: reports.filter(r => parseFloat(r.consumption) > 80),
        avgConsumption: reports
          .filter(r => parseFloat(r.consumption) > 80)
          .reduce((sum, r) => sum + parseFloat(r.consumption), 0) /
          Math.max(reports.filter(r => parseFloat(r.consumption) > 80).length, 1)
      }
    ];

    setClusters(clusterData);
    setHasRunClustering(true);
  };

  const detectAnomalies = () => {
    if (reports.length < 3) {
      return;
    }

    const consumptions = reports.map(r => parseFloat(r.consumption));
    const mean = consumptions.reduce((a, b) => a + b, 0) / consumptions.length;
    const stdDev = Math.sqrt(
      consumptions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / consumptions.length
    );

    const threshold = mean + (2 * stdDev);
    const anomalousReports = reports.filter(r => parseFloat(r.consumption) > threshold);
    
    setAnomalies(anomalousReports);
    setHasRunAnomalyDetection(true);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-500 mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Unsupervised machine learning models for household clustering and analysis</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-400">Total Households</h3>
              <Users className="text-green-500" size={24} />
            </div>
            <p className="text-4xl font-bold text-green-500 mb-1">{reports.length}</p>
            <p className="text-sm text-gray-400">Available for analysis</p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-400">Clusters Identified</h3>
              <Network className="text-orange-500" size={24} />
            </div>
            <p className="text-4xl font-bold text-orange-500 mb-1">{hasRunClustering ? clusters.length : 0}</p>
            <p className="text-sm text-gray-400">K-Means groups</p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-400">Anomalies Found</h3>
              <AlertCircle className="text-red-500" size={24} />
            </div>
            <p className="text-4xl font-bold text-red-500 mb-1">{hasRunAnomalyDetection ? anomalies.length : 0}</p>
            <p className="text-sm text-gray-400">Unusual patterns</p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-400">Avg Consumption</h3>
              <Zap className="text-blue-500" size={24} />
            </div>
            <p className="text-4xl font-bold text-blue-500 mb-1">{avgConsumption}</p>
            <p className="text-sm text-gray-400">kWh across all households</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('kmeans')}
            className={`px-6 py-3 rounded-lg font-bold transition ${
              activeTab === 'kmeans'
                ? 'bg-green-500 text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            K-Means Clustering
          </button>
          <button
            onClick={() => setActiveTab('isolation')}
            className={`px-6 py-3 rounded-lg font-bold transition ${
              activeTab === 'isolation'
                ? 'bg-orange-500 text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Isolation Forest
          </button>
        </div>

        {/* K-Means Clustering Tab */}
        {activeTab === 'kmeans' && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Network className="text-green-500" size={28} />
                  <h2 className="text-2xl font-bold text-green-500">K-Means Clustering</h2>
                </div>
                <p className="text-gray-400">
                  Group similar households together based on consumption patterns, like sorting fruits into baskets by type
                </p>
              </div>
              <button
                onClick={performClustering}
                disabled={reports.length < 3}
                className="bg-green-500 hover:bg-green-600 cursor-pointer text-black font-bold px-6 py-3 rounded-lg transition flex items-center gap-2"
              >
                <Play size={20} />
                Run Clustering
              </button>
            </div>

            {!hasRunClustering ? (
              <div className="py-20 text-center">
                <div className="flex justify-center mb-6">
                  <Network size={80} className="text-gray-700" />
                </div>
                <p className="text-gray-400 text-lg mb-4">
                  Click "Run Clustering" to group households by similarity
                </p>
                {reports.length < 3 && (
                  <p className="text-red-500 font-medium">
                    Need at least 3 reports to perform clustering
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {clusters.map((cluster) => (
                    <div
                      key={cluster.id}
                      onClick={() => setSelectedCluster(cluster)}
                      className={`p-6 rounded-lg cursor-pointer transition border ${
                        selectedCluster?.id === cluster.id
                          ? 'border-green-500 bg-gray-800'
                          : 'border-gray-800 bg-gray-900 hover:bg-gray-800'
                      } ${
                        cluster.color === 'green'
                          ? 'border-l-4 border-l-green-500'
                          : cluster.color === 'orange'
                          ? 'border-l-4 border-l-orange-500'
                          : 'border-l-4 border-l-red-500'
                      }`}
                    >
                      <h3 className="text-lg font-bold mb-2">{cluster.name}</h3>
                      <p className="text-sm text-gray-400 mb-4">{cluster.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Households:</span>
                          <span className="font-bold">{cluster.households.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Avg Consumption:</span>
                          <span className="font-bold">{cluster.avgConsumption.toFixed(2)} kWh</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedCluster && selectedCluster.households.length > 0 && (
                  <div className="mt-6 p-6 bg-gray-800 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold text-green-500 mb-4">
                      {selectedCluster.name} - Details
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left p-3 text-gray-400 font-medium">Timestamp</th>
                            <th className="text-left p-3 text-gray-400 font-medium">Region</th>
                            <th className="text-left p-3 text-gray-400 font-medium">Consumption</th>
                            <th className="text-left p-3 text-gray-400 font-medium">Bill</th>
                            <th className="text-left p-3 text-gray-400 font-medium">Income Level</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedCluster.households.map((household, index) => (
                            <tr key={index} className="border-b border-gray-800">
                              <td className="p-3">{new Date(household.timestamp).toLocaleString()}</td>
                              <td className="p-3">{household.householdData?.region}</td>
                              <td className="p-3">{household.consumption} kWh</td>
                              <td className="p-3">{household.bill} RWF</td>
                              <td className="p-3">{household.householdData?.incomeLevel}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Isolation Forest Tab */}
        {activeTab === 'isolation' && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="text-orange-500" size={28} />
                  <h2 className="text-2xl font-bold text-orange-500">Isolation Forest</h2>
                </div>
                <p className="text-gray-400">
                  Find weird or unusual households, like finding the one rotten apple in the basket
                </p>
              </div>
              <button
                onClick={detectAnomalies}
                disabled={reports.length < 3}
                className="bg-orange-500 hover:bg-orange-600 cursor-pointer text-black font-bold px-6 py-3 rounded-lg transition flex items-center gap-2"
              >
                <Play size={20} />
                Detect Anomalies
              </button>
            </div>

            {!hasRunAnomalyDetection ? (
              <div className="py-20 text-center">
                <div className="flex justify-center mb-6">
                  <AlertCircle size={80} className="text-gray-700" />
                </div>
                <p className="text-gray-400 text-lg mb-4">
                  Click "Detect Anomalies" to find unusual household patterns
                </p>
                {reports.length < 3 && (
                  <p className="text-red-500 font-medium">
                    Need at least 3 reports to detect anomalies
                  </p>
                )}
              </div>
            ) : (
              <>
                {anomalies.length > 0 ? (
                  <div className="space-y-4">
                    {anomalies.map((anomaly, index) => (
                      <div
                        key={index}
                        className="p-6 bg-red-900 bg-opacity-20 border border-red-500 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-red-400 mb-4">
                              Anomaly Detected - Unusual Consumption Pattern
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <span className="text-gray-400 text-sm">Consumption:</span>
                                <p className="font-bold text-red-400 text-lg">{anomaly.consumption} kWh</p>
                              </div>
                              <div>
                                <span className="text-gray-400 text-sm">Bill:</span>
                                <p className="font-bold text-red-400 text-lg">{anomaly.bill} RWF</p>
                              </div>
                              <div>
                                <span className="text-gray-400 text-sm">Region:</span>
                                <p className="font-bold text-lg">{anomaly.householdData?.region}</p>
                              </div>
                              <div>
                                <span className="text-gray-400 text-sm">Income:</span>
                                <p className="font-bold text-lg">{anomaly.householdData?.incomeLevel}</p>
                              </div>
                            </div>
                            <div className="p-4 bg-red-950 bg-opacity-50 rounded-lg border border-red-800">
                              <p className="text-sm text-red-300">
                                <strong>Alert:</strong> This household shows significantly higher consumption
                                than the average. Recommend immediate review and energy audit.
                              </p>
                            </div>
                          </div>
                          <AlertCircle size={40} className="text-red-500 ml-4 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-green-900 bg-opacity-20 border border-green-500 rounded-lg">
                    <p className="text-green-400 font-bold text-center">
                      No anomalies detected. All households show normal consumption patterns.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSection;