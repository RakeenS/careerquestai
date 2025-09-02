import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Chrome } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useActivity } from '../context/ActivityContext';

interface AutoApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AutoApplyModal: React.FC<AutoApplyModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'info' | 'download'>('info');
  const { user } = useAuth();
  const { addActivity } = useActivity();

  // User account info will be used to authenticate with the extension

  const handleDownload = () => {
    // This would be replaced with actual download logic when extension is created
    if (user) {
      addActivity('tool', 'Downloaded Auto Apply extension');
      setStep('download');
    } else {
      // Would handle unauthenticated users in a real implementation
      console.log('User not authenticated');
      setStep('download'); // Proceed anyway for demo purposes
    }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.1,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black"
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden relative"
            >
              {/* Modal header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <h3 className="text-xl font-bold flex items-center">
                  <Chrome className="mr-2" /> Auto Apply Chrome Extension
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-white/20 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal content */}
              <div className="p-6">
                {step === 'info' ? (
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      Automate Your Job Applications
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      Our Chrome extension connects to your CareerQuestAI account to help you apply 
                      to multiple jobs faster and more efficiently.
                    </p>
                    
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                      <h5 className="font-medium text-gray-900 dark:text-white">Key Features:</h5>
                      <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Auto-fill application forms on major job sites</li>
                        <li>Customize responses to job-specific questions</li>
                        <li>Track which jobs you've applied to</li>
                        <li>Optimize your application with AI-powered suggestions</li>
                        <li>Apply to multiple jobs in a single session</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        <strong>Note:</strong> This extension requires a Chrome browser and access to your 
                        CareerQuestAI account to function properly.
                      </p>
                    </div>

                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={handleDownload}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow flex items-center justify-center hover:from-green-600 hover:to-emerald-700 transition transform hover:scale-105"
                      >
                        <Download className="mr-2" /> Download Extension
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                      <Download className="text-green-600 dark:text-green-400" size={32} />
                    </div>
                    <h4 className="text-xl font-medium text-gray-900 dark:text-white">
                      Thank You for Downloading!
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 max-w-md mx-auto">
                      Follow the installation instructions in your browser to complete setup. 
                      After installation, sign in with your CareerQuestAI account to get started.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mt-4 text-left">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Installation Steps:</h5>
                      <ol className="list-decimal pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                        <li>Go to Chrome's Extensions page (chrome://extensions/)</li>
                        <li>Enable "Developer mode"</li>
                        <li>Drag and drop the downloaded file to the extensions page</li>
                        <li>Click "Add extension" to confirm</li>
                      </ol>
                    </div>
                    <button
                      onClick={onClose}
                      className="mt-6 px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AutoApplyModal;
