import React from 'react';
import { X, RefreshCw, Save } from 'lucide-react';
import { motion } from 'framer-motion';

interface TailoredResumeModalProps {
  content: string;
  onClose: () => void;
  onRegenerate: () => void;
  onSave: () => void;
}

const TailoredResumeModal: React.FC<TailoredResumeModalProps> = ({
  content,
  onClose,
  onRegenerate,
  onSave,
}) => {
  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full m-4 max-h-[80vh] overflow-y-auto"
        initial={{ scale: 0.95, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 50 }}
      >
        <h3 className="text-xl font-semibold mb-4">Tailored Resume</h3>
        <div className="mb-4 p-4 border rounded whitespace-pre-wrap">
          {content}
        </div>
        <div className="flex justify-end space-x-4">
          <motion.button
            onClick={onClose}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-100"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="mr-2 h-4 w-4" />
            Decline
          </motion.button>
          <motion.button
            onClick={onRegenerate}
            className="flex items-center px-4 py-2 border border-blue-300 rounded-md text-blue-700 bg-white hover:bg-blue-100"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </motion.button>
          <motion.button
            onClick={onSave}
            className="flex items-center px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Resume
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TailoredResumeModal;