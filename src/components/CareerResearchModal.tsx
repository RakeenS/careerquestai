import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Briefcase, DollarSign, TrendingUp, Award, GraduationCap, Clock, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useActivity } from '../context/ActivityContext';

interface CareerResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CareerResearchResult {
  description: string;
  averageSalary: string;
  salaryRange: string;
  outlook: string;
  growthRate: string;
  skills: string[];
  education: string;
  experience: string;
  relatedCareers: string[];
}

const CareerResearchModal: React.FC<CareerResearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CareerResearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { addActivity } = useActivity();

  // Focus the search input when the modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const searchInput = document.getElementById('career-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (query.trim() === '') {
      setError('Please enter a job title or company name');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setResults(null);

      const userId = user?.id || 'anonymous';
      console.log("Starting career research for:", query);
      
      // Get the backend URL based on environment
      const backendUrl = import.meta.env.VITE_API_URL || 'https://resume-builder-backend-ry5e.onrender.com';
      
      // Always use the serverless function for both mobile and desktop
      try {
        // Add timestamp to prevent caching issues on Safari
        const timestamp = new Date().getTime();
        const apiPath = `/api/career-research?_t=${timestamp}`;
        
        // Use relative URL path for deployed site or full URL for development
        const apiUrl = window.location.hostname === 'localhost' 
          ? `${backendUrl}${apiPath}`
          : apiPath;
        
        console.log(`Making career research request to: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ 
            query,
            userId 
          }),
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-cache',
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to get career research results');
        }
        
        setResults(result.data.results);
      } catch (error) {
        console.error("Error with career research:", error);
        throw error;
      }

      // Track the activity
      addActivity('resume', `Researched career information for: ${query}`);
      
    } catch (error) {
      console.error('Search error:', error);
      setError('Error searching for career information. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Helper function to get color based on outlook
  const getOutlookColor = (outlook: string) => {
    switch (outlook?.toLowerCase()) {
      case 'excellent': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'good': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      case 'fair': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'poor': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const renderResults = () => {
    if (!results) return null;

    // For string-based results fallback (if we get a string instead of structured data)
    if (typeof results === 'string') {
      return (
        <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4">{query}</h3>
          <div className="whitespace-pre-line">
            {results}
          </div>
        </div>
      );
    }
    
    return (
      <div className="mt-6 overflow-hidden rounded-lg shadow-sm">
        {/* Header banner with job title */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white">
          <h3 className="text-2xl font-bold flex items-center">
            <Briefcase className="mr-2" size={24} />
            {query}
          </h3>
          <p className="mt-2 opacity-90">{results.description}</p>
        </div>
        
        {/* Main content section */}
        <div className="bg-white dark:bg-gray-800 p-6">
          {/* Salary and outlook section - in a grid for desktop, stack for mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-amber-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
              <h4 className="text-lg font-semibold mb-2 flex items-center text-amber-700 dark:text-amber-300">
                <DollarSign className="mr-2" size={20} />
                Compensation
              </h4>
              <div className="space-y-2">
                <p><span className="font-medium">Average:</span> {results.averageSalary}</p>
                <p><span className="font-medium">Range:</span> {results.salaryRange}</p>
              </div>
            </div>
            
            <div className="bg-amber-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
              <h4 className="text-lg font-semibold mb-2 flex items-center text-amber-700 dark:text-amber-300">
                <TrendingUp className="mr-2" size={20} />
                Growth
              </h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Outlook:</span> 
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getOutlookColor(results.outlook)}`}>
                    {results.outlook}
                  </span>
                </div>
                <p><span className="font-medium">Growth Rate:</span> {results.growthRate}</p>
              </div>
            </div>
          </div>
          
          {/* Skills section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3 flex items-center text-amber-700 dark:text-amber-300">
              <Award className="mr-2" size={20} />
              Required Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(results.skills) ? results.skills.map((skill, index) => (
                <span key={index} className="bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              )) : <p>{results.skills}</p>}
            </div>
          </div>
          
          {/* Requirements section - in a grid for desktop, stack for mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="text-lg font-semibold mb-2 flex items-center text-amber-700 dark:text-amber-300">
                <GraduationCap className="mr-2" size={20} />
                Education
              </h4>
              <p>{results.education}</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2 flex items-center text-amber-700 dark:text-amber-300">
                <Clock className="mr-2" size={20} />
                Experience
              </h4>
              <p>{results.experience}</p>
            </div>
          </div>
          
          {/* Related careers section */}
          <div>
            <h4 className="text-lg font-semibold mb-3 flex items-center text-amber-700 dark:text-amber-300">
              <Share2 className="mr-2" size={20} />
              Related Careers
            </h4>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(results.relatedCareers) ? results.relatedCareers.map((career, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(career)}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1 rounded-md text-sm transition-colors"
                >
                  {career}
                </button>
              )) : <p>{results.relatedCareers}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl shadow-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10"
        >
          <X size={24} />
        </button>

        <div className="p-6 overflow-y-auto max-h-[75vh]" style={{ WebkitOverflowScrolling: 'touch' }}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Briefcase className="mr-2" size={24} />
            Career Research
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter a job title or company name
            </label>
            <div className="relative">
              <input
                id="career-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g., Software Engineer or Tesla, Inc."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              />
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
              >
                {isLoading ? "Searching..." : <Search size={18} />}
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Researching career information...</p>
            </div>
          )}

          {renderResults()}

          <div className="mt-6 flex justify-end">
            {results && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults(null);
                }}
                className="mr-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg"
              >
                New Search
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CareerResearchModal;
