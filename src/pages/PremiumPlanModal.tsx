import React from 'react';
import { motion } from 'framer-motion';
import { X, Check, Lock, ExternalLink, Gift } from 'lucide-react';

interface PremiumPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: () => void;
  onLogin: () => void;
}

const PremiumPlanModal: React.FC<PremiumPlanModalProps> = ({ 
  isOpen, 
  onClose, 
  onSignUp,
  onLogin
}) => {
  if (!isOpen) return null;

  const premiumFeatures = [
    'Resume AI Optimization',
    'ATS Compatibility Analysis',
    'Unlimited Resume Downloads',
    'Cover Letter Generation',
    'LinkedIn Profile Optimization',
    'Interview Preparation Tools'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center mb-3">
            <Gift className="text-white mr-2 h-5 w-5" />
            <h3 className="text-lg font-semibold text-white">Premium Features</h3>
          </div>
          <h2 className="text-2xl font-bold text-white">Access AI-Powered Resume Tools</h2>
          <p className="text-white/80 mt-2">
            Enhance your job search with our professional AI tools designed to help you stand out from the competition.
          </p>
        </div>
        
        <div className="p-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Premium Plan Includes:</h3>
          <ul className="space-y-3 mb-6">
            {premiumFeatures.map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-3 mt-0.5">
                  <Check size={14} className="text-green-600 dark:text-green-400" />
                </span>
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mb-5 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <span className="font-medium text-green-800 dark:text-green-500">
              All premium features are now FREE for all users!
            </span>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={onSignUp}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center"
            >
              Create Free Account
              <ExternalLink size={16} className="ml-2" />
            </button>
            <div className="text-center">
              <button
                onClick={onLogin}
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                Already have an account? Log in
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PremiumPlanModal;
