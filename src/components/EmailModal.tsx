import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (jobInfo: string, tone: string, stage: string) => void;
  isLoading?: boolean;
}

const toneOptions = [
  'Professional',
  'Enthusiastic',
  'Grateful',
  'Confident',
  'Humble'
];

const stageOptions = [
  'After Initial Interview',
  'After Second Interview',
  'After Final Interview',
  'After Technical Assessment',
  'One Week Follow-up',
  'Two Weeks Follow-up'
];

const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, onGenerate, isLoading }) => {
  const [jobInfo, setJobInfo] = useState('');
  const [tone, setTone] = useState('Professional');
  const [stage, setStage] = useState('After Initial Interview');

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full m-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Generate Follow-up Email</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Job Description or Interview Details
            </label>
            <textarea
              value={jobInfo}
              onChange={(e) => setJobInfo(e.target.value)}
              placeholder="Paste job description or provide interview details..."
              className="w-full p-3 border rounded-lg min-h-[100px] dark:bg-gray-700"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-3 border rounded-lg dark:bg-gray-700"
              >
                {toneOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Interview Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full p-3 border rounded-lg dark:bg-gray-700"
              >
                {stageOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={() => onGenerate(jobInfo, tone, stage)}
            disabled={isLoading || !jobInfo.trim()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin mr-2" size={18} />
                Generating...
              </>
            ) : (
              'Generate Email'
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmailModal;