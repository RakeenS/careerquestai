import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simple redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-xl rounded-xl p-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Account Created Successfully!
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Your account has been created. You now have access to all features of CareerQuestAI.
        </p>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Redirecting to dashboard in a few seconds...
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
