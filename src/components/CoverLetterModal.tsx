import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader } from 'lucide-react';

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (name: string, jobUrl: string) => void;
  isLoading?: boolean;
}

const CoverLetterModal: React.FC<CoverLetterModalProps> = ({ isOpen, onClose, onGenerate, isLoading }) => {
  const [name, setName] = useState('');
  const [jobUrl, setJobUrl] = useState('');

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
        className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full m-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Generate Cover Letter</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-lg dark:bg-gray-700"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Job Posting URL or Description</label>
            <textarea
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className="w-full p-3 border rounded-lg dark:bg-gray-700"
              rows={4}
              placeholder="Paste job URL or description here..."
            />
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
            onClick={() => onGenerate(name, jobUrl)}
            disabled={isLoading || !name.trim() || !jobUrl.trim()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin mr-2" size={18} />
                Generating...
              </>
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CoverLetterModal;