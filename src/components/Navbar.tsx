import { useState } from 'react';
import { ChevronDown, CreditCard } from 'lucide-react';

const Navbar = ({ setShowPaymentModal, setPaymentMethod }) => {
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  const handlePaymentSelect = (method) => {
    setPaymentMethod(method);
    setShowPaymentModal(true);
    setShowPaymentDropdown(false);
  };

  return (
    <nav className="bg-gray-900 border-b-2 border-green-500 p-4 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-orange-500">Dashboard</h2>
        <p className="text-sm text-green-500">Household Energy Management</p>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
          className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 rounded flex items-center space-x-2 transition"
        >
          <CreditCard size={20} />
          <span>Pay Energy Bill</span>
          <ChevronDown size={16} />
        </button>

        {showPaymentDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border-2 border-green-500 rounded shadow-lg z-50">
            <button
              onClick={() => handlePaymentSelect('momo')}
              className="w-full px-4 py-3 text-left hover:bg-green-500 hover:text-black transition border-b border-gray-700"
            >
              MTN MoMo
            </button>
            <button
              onClick={() => handlePaymentSelect('paypal')}
              className="w-full px-4 py-3 text-left hover:bg-green-500 hover:text-black transition"
            >
              PayPal
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
