import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AdminSection from './components/AdminSection';
import PredictionSection from './components/PredictionSection';
import AnalysisSection from './components/AnalysisSection';
import ReportSection from './components/ReportSection';
import SettingsSection from './components/SettingsSection';

function App() {
  const [activeSection, setActiveSection] = useState('prediction');
  const [reports, setReports] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');

  const handleGenerateReport = (reportData) => {
    const newReport = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...reportData
    };
    setReports([...reports, newReport]);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'admin':
        return <AdminSection reports={reports} />;
      case 'prediction':
        return <PredictionSection onGenerateReport={handleGenerateReport} />;
      case 'analysis':
        return <AnalysisSection reports={reports} />;
      case 'report':
        return <ReportSection reports={reports} />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <PredictionSection onGenerateReport={handleGenerateReport} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="ml-64">
        <Navbar
          setShowPaymentModal={setShowPaymentModal}
          setPaymentMethod={setPaymentMethod}
        />

        <main className="p-8">
          {renderSection()}
        </main>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg max-w-md w-full border-2 border-green-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-orange-500">
                {paymentMethod === 'momo' ? 'MTN MoMo Payment' : 'PayPal Payment'}
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-white hover:text-red-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {paymentMethod === 'momo' ? (
                <>
                  <div>
                    <label className="block text-sm mb-2 text-green-500">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="078XXXXXXX"
                      className="w-full px-4 py-2 bg-gray-800 border border-green-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-green-500">Amount (RWF)</label>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      className="w-full px-4 py-2 bg-gray-800 border border-green-500 rounded text-white"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm mb-2 text-green-500">PayPal Email</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="w-full px-4 py-2 bg-gray-800 border border-green-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-green-500">Amount (RWF)</label>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      className="w-full px-4 py-2 bg-gray-800 border border-green-500 rounded text-white"
                    />
                  </div>
                </>
              )}

              <button
                onClick={() => {
                  alert('Payment Successful!');
                  setShowPaymentModal(false);
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded transition"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
