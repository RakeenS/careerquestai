import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader, Link as LinkIcon, AlertCircle, Briefcase, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
// import { checkAndIncrementUsage } from '../../lib/openai';

interface LinkedInOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOptimize: (profileUrl: string, jobTitle: string, industry: string) => Promise<void>;
  isLoading?: boolean;
}

const LinkedInOptimizerModal: React.FC<LinkedInOptimizerModalProps> = ({
  isOpen,
  onClose,
  onOptimize,
  isLoading
}) => {
  const [profileUrl, setProfileUrl] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with profileUrl:', profileUrl);
    setError(null);

    if (!user) {
      setError('Please log in to use this feature');
      return;
    }

    if (!profileUrl.includes('linkedin.com/in/')) {
      setError('Please enter a valid LinkedIn profile URL');
      return;
    }
    
    if (!jobTitle.trim()) {
      setError('Please enter your current or desired job title');
      return;
    }
    
    if (!industry.trim()) {
      setError('Please enter your industry');
      return;
    }

    try {
      // For development: bypass API usage check
      // const canUseApi = await checkAndIncrementUsage(user.id);
      // console.log('API usage check result:', canUseApi);
      // 
      // if (!canUseApi) {
      //   setError('You have reached your daily API usage limit. Please try again tomorrow.');
      //   return;
      // }

      console.log('Calling onOptimize with:', { profileUrl, jobTitle, industry });
      await onOptimize(profileUrl, jobTitle, industry);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError('An error occurred while processing your request. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">LinkedIn Profile Optimizer</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              LinkedIn Profile URL
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="url"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                className="w-full pl-10 p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="https://www.linkedin.com/in/username"
                required
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Enter your LinkedIn profile URL for personalized optimization
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current or Desired Job Title
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full pl-10 p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="e.g. Senior Software Engineer, Marketing Manager"
                required
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This helps us tailor recommendations to your specific career goals
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Industry
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full pl-10 p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="e.g. Technology, Healthcare, Finance"
                required
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This helps us provide industry-specific keyword recommendations
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-lg flex items-center">
              <AlertCircle className="mr-2" size={20} />
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !profileUrl}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin mr-2" size={18} />
                  Analyzing...
                </>
              ) : (
                'Optimize Profile'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default LinkedInOptimizerModal;