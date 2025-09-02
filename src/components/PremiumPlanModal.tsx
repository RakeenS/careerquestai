import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Gift, Star } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface PremiumPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastRequestedFeature?: string;
}

const PremiumPlanModal: React.FC<PremiumPlanModalProps> = ({ 
  isOpen, 
  onClose, 
  lastRequestedFeature
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        const loggedIn = !!session;
        setIsLoggedIn(loggedIn);
        
        if (loggedIn && session.user) {
          setUserEmail(session.user.email || '');  
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      checkAuth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const premiumFeatures = [
    'AI Resume Optimization',
    'ATS Compatibility Analysis', 
    'Unlimited Resume Downloads',
    'AI Cover Letter Generation',
    'LinkedIn Profile Optimization',
    'Interview Preparation Tools'
  ];

  const handleContinueClick = () => {
    if (!isLoggedIn) {
      // Redirect to sign up page if not logged in
      window.location.href = '/signup?redirect=dashboard';
      return;
    }

    // Close modal and grant access
    onClose();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full inline-flex mb-4">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            All Features Are FREE!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {lastRequestedFeature ? `Access ${lastRequestedFeature} and all premium features for free.` : 'All premium features are now available for free!'}
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <Star className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
            <span className="font-semibold text-green-800 dark:text-green-300 text-sm">
              Limited Time Offer
            </span>
          </div>
          <p className="text-green-700 dark:text-green-400 text-xs text-center">
            No payment required • No credit card needed
          </p>
        </div>

        <h4 className="font-medium text-gray-900 dark:text-white mb-4">What you get for FREE:</h4>
        <ul className="space-y-2 mb-6">
          {premiumFeatures.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-3 mt-0.5">
                <Check size={12} className="text-green-600 dark:text-green-400" />
              </span>
              <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="space-y-3">
          <button
            onClick={handleContinueClick}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center"
          >
            {isLoggedIn ? 'Continue with Free Access' : 'Sign Up for Free Access'}
          </button>
          {isLoggedIn ? (
            <div className="text-center mt-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                You're logged in as {userEmail}
              </p>
            </div>
          ) : (
            <div className="text-center mt-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Create a free account to save your work and access all features
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

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
            <h3 className="text-lg font-semibold text-white">Free Premium Access</h3>
          </div>
          <h2 className="text-2xl font-bold text-white">Unlock AI-Powered Resume Tools</h2>
          <p className="text-white/80 mt-2">
            Get professional AI tools to enhance your job search - completely free for a limited time.
          </p>
        </div>
        
        {renderContent()}
      </motion.div>
    </div>
  );
};

export default PremiumPlanModal;