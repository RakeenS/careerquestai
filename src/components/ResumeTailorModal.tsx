import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, FileUp, Loader } from 'lucide-react';

interface ResumeTailorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTailor: (jobInfo: string, resumeContent: string) => Promise<void>;
  isLoading?: boolean;
}

const ResumeTailorModal: React.FC<ResumeTailorModalProps> = ({ isOpen, onClose, onTailor, isLoading }) => {
  const [jobInfo, setJobInfo] = useState('');
  const [resumeContent, setResumeContent] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setResumeContent(e.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (jobInfo.trim() && resumeContent.trim()) {
      await onTailor(jobInfo, resumeContent);
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Resume Tailor</h2>
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
              Job Description or URL
            </label>
            <textarea
              value={jobInfo}
              onChange={(e) => setJobInfo(e.target.value)}
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={6}
              placeholder="Paste the job description or URL here..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Resume Content
            </label>
            <textarea
              value={resumeContent}
              onChange={(e) => setResumeContent(e.target.value)}
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={6}
              placeholder="Paste your resume content here..."
              required
            />
          </div>

          <div className="flex items-center">
            <span className="mr-2 text-gray-700 dark:text-gray-300">Or</span>
            <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
              <FileUp className="mr-2" size={18} />
              Upload Resume
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".txt,.doc,.docx,.pdf"
              />
            </label>
            {file && (
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {file.name}
              </span>
            )}
          </div>

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
              disabled={isLoading || !jobInfo.trim() || !resumeContent.trim()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin mr-2" size={18} />
                  Tailoring...
                </>
              ) : (
                'Tailor Resume'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ResumeTailorModal;