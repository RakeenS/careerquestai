import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Transition } from '@headlessui/react';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  HeartIcon as HeartIconOutline,
  ChevronDownIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ViewColumnsIcon, 
  Bars4Icon,
  StarIcon,
  BookmarkIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { useDarkMode } from '../context/DarkModeContext';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

// Define job data structure
interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
  jobType: string;
  postedDate: string;
  color: string;
  experience: string;
  companySize: string;
  initials: string;
  skills: string[];
  featured?: boolean;
  isNew?: boolean;
}

// Sample job data with enhanced details for modern UI
const jobsList: Job[] = [
  {
    id: 1,
    title: 'Senior Frontend Engineer',
    company: 'Acme Tech',
    location: 'Remote',
    description: 'Build modern user interfaces with React and TypeScript. Work with a team of engineers to create responsive web applications with cutting-edge technologies.',
    salary: '$120,000 - $150,000',
    jobType: 'Full-time',
    postedDate: '2 days ago',
    color: '#4F46E5',
    experience: 'Senior',
    companySize: '51-200',
    initials: 'AT',
    skills: ['React', 'TypeScript', 'TailwindCSS', 'Next.js', 'Redux'],
    featured: true,
    isNew: true
  },
  {
    id: 2,
    title: 'Backend Developer',
    company: 'DataFlow Systems',
    location: 'New York, NY',
    description: 'Design and implement scalable APIs using Node.js and Express. Experience with AWS or similar cloud platforms is a plus. Work with a diverse team of engineers.',
    salary: '$100,000 - $140,000',
    jobType: 'Full-time',
    postedDate: '1 week ago',
    color: '#10B981',
    experience: 'Mid-Level',
    companySize: '201-500',
    initials: 'DS',
    skills: ['Node.js', 'Express', 'MongoDB', 'AWS', 'Docker']
  },
  {
    id: 3,
    title: 'UX/UI Designer',
    company: 'Creative Solutions',
    location: 'San Francisco, CA',
    description: 'Create beautiful, intuitive interfaces for web and mobile applications. Strong portfolio demonstrating UX expertise required. Collaborate with product teams.',
    salary: '$90,000 - $130,000',
    jobType: 'Full-time',
    postedDate: '3 days ago',
    color: '#EF4444',
    experience: 'Mid-Level',
    companySize: '11-50',
    initials: 'CS',
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems'],
    featured: true
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    company: 'CloudScale',
    location: 'Remote',
    description: 'Manage cloud infrastructure and CI/CD pipelines. Experience with Kubernetes, Docker, and AWS required. Implement and maintain scalable infrastructures.',
    salary: '$130,000 - $170,000',
    jobType: 'Contract',
    postedDate: '5 days ago',
    color: '#06B6D4',
    experience: 'Senior',
    companySize: '51-200',
    initials: 'CS',
    skills: ['Kubernetes', 'Docker', 'CI/CD', 'Terraform', 'AWS']
  },
  {
    id: 5,
    title: 'Product Manager',
    company: 'InnovateCorp',
    location: 'Austin, TX',
    description: 'Lead product development from conception to launch. Define product vision, strategy, and roadmap. Collaborate with design, engineering, and marketing teams.',
    salary: '$125,000 - $165,000',
    jobType: 'Full-time',
    postedDate: '2 weeks ago',
    color: '#8B5CF6',
    experience: 'Senior',
    companySize: '501-1000',
    initials: 'IC',
    skills: ['Agile', 'Roadmapping', 'User Stories', 'A/B Testing', 'Market Research']
  },
  {
    id: 6,
    title: 'Data Scientist',
    company: 'AnalyticaAI',
    location: 'Chicago, IL',
    description: 'Apply machine learning techniques to solve complex business problems. Experience with Python and data visualization. Work on cutting-edge AI models.',
    salary: '$140,000 - $180,000',
    jobType: 'Full-time',
    postedDate: '4 days ago',
    color: '#F59E0B',
    experience: 'Mid-Level',
    companySize: '51-200',
    initials: 'A',
    skills: ['Python', 'TensorFlow', 'Data Visualization', 'SQL', 'Machine Learning'],
    isNew: true
  },
  {
    id: 7,
    title: 'Full Stack Developer',
    company: 'Webify Solutions',
    location: 'Remote',
    description: 'Develop both frontend and backend components for web applications. Experience with modern JavaScript frameworks and backend technologies required.',
    salary: '$95,000 - $135,000',
    jobType: 'Full-time',
    postedDate: '1 day ago',
    color: '#3B82F6',
    experience: 'Mid-Level',
    companySize: '11-50',
    initials: 'WS',
    skills: ['React', 'Node.js', 'PostgreSQL', 'GraphQL', 'TypeScript'],
    isNew: true
  },
  {
    id: 8,
    title: 'Mobile App Developer',
    company: 'AppGenius',
    location: 'Boston, MA',
    description: 'Create native mobile applications for iOS and Android. Strong knowledge of Swift, Kotlin, or React Native required. Focus on performance and user experience.',
    salary: '$110,000 - $150,000',
    jobType: 'Full-time',
    postedDate: '1 week ago',
    color: '#EC4899',
    experience: 'Senior',
    companySize: '11-50',
    initials: 'AG',
    skills: ['iOS', 'Android', 'Swift', 'Kotlin', 'React Native']
  }
];

// Filter options
const jobTypeFilters = ['All Types', 'Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
const locationFilters = ['All Locations', 'Remote', 'New York, NY', 'San Francisco, CA', 'Austin, TX', 'Chicago, IL', 'Boston, MA'];
const experienceLevels = ['All Levels', 'Entry-Level', 'Mid-Level', 'Senior', 'Director'];
const companySizes = ['All Sizes', '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
const salaryRanges = ['All Ranges', '$0-$50K', '$50K-$100K', '$100K-$150K', '$150K-$200K', '$200K+'];

// Animation variants for Framer Motion

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  },
  hover: { 
    y: -5, 
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
    transition: { type: 'spring', stiffness: 200 }
  }
};

const JobsPage: React.FC = () => {
  // Access global dark mode state
  const { darkMode: isDarkMode } = useDarkMode();
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedJobType, setSelectedJobType] = useState('All Types');
  const [selectedExperience, setSelectedExperience] = useState('All Levels');
  const [selectedSalary, setSelectedSalary] = useState('All Ranges');
  const [selectedCompanySize, setSelectedCompanySize] = useState('All Sizes');
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMounted, setIsMounted] = useState(false);
  
  // Load saved jobs from localStorage on component mount
  useEffect(() => {
    // Set mounted state for client-side animations
    setIsMounted(true);
    
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      setSavedJobs(JSON.parse(saved));
    }
  }, []);
  
  // Save to localStorage when savedJobs changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    }
  }, [savedJobs, isMounted]);

  // Filter jobs based on all criteria
  const filteredJobs = jobsList.filter(job => {
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Basic filters
    const matchesLocation = selectedLocation === 'All Locations' || job.location === selectedLocation;
    const matchesJobType = selectedJobType === 'All Types' || job.jobType === selectedJobType;
    
    // Advanced filters
    const matchesExperience = selectedExperience === 'All Levels' || job.experience === selectedExperience;
    const matchesCompanySize = selectedCompanySize === 'All Sizes' || job.companySize === selectedCompanySize;
    
    // Salary range filter is more complex
    let matchesSalary = selectedSalary === 'All Ranges';
    if (!matchesSalary) {
      const jobSalaryText = job.salary.replace(/[^0-9-]/g, '');
      const [minSalary, maxSalary] = jobSalaryText.split('-').map(Number);
      
      if (selectedSalary === '$0-$50K') {
        matchesSalary = maxSalary <= 50000;
      } else if (selectedSalary === '$50K-$100K') {
        matchesSalary = minSalary >= 50000 && maxSalary <= 100000;
      } else if (selectedSalary === '$100K-$150K') {
        matchesSalary = minSalary >= 100000 && maxSalary <= 150000;
      } else if (selectedSalary === '$150K-$200K') {
        matchesSalary = minSalary >= 150000 && maxSalary <= 200000;
      } else if (selectedSalary === '$200K+') {
        matchesSalary = minSalary >= 200000;
      }
    }
    
    return matchesSearch && matchesLocation && matchesJobType && 
           matchesExperience && matchesCompanySize && matchesSalary;
  });

  // Toggle job save status
  const toggleSaveJob = (jobId: number, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setSavedJobs(prev => {
      if (prev.includes(jobId)) {
        return prev.filter(id => id !== jobId);
      } else {
        return [...prev, jobId];
      }
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('All Locations');
    setSelectedJobType('All Types');
    setSelectedExperience('All Levels');
    setSelectedSalary('All Ranges');
    setSelectedCompanySize('All Sizes');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      {/* Sticky header with glassmorphism */}
      <div 
        className={`sticky top-0 z-50 ${isDarkMode ? 
          'bg-gray-900/80 backdrop-blur-xl' : 
          'bg-white/80 backdrop-blur-xl'} shadow-md transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold"
          >
            Job Explorer
          </motion.h2>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              aria-label="Toggle view mode"
            >
              {viewMode === 'grid' ? 
                <ViewColumnsIcon className="h-5 w-5" /> : 
                <Bars4Icon className="h-5 w-5" />}
            </button>
            {/* Dark mode toggle removed - using global toggle in header */}
          </div>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className={`${isDarkMode ? 'bg-amber-600' : 'bg-amber-500'} text-white px-4 py-3`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-lg"
            >
              🚧 Coming Soon! 🚧 The job search feature is under development. These listings are placeholders.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Hero header with gradient */}
      <div className={`bg-gradient-to-br ${isDarkMode ? 'from-blue-900 to-purple-900' : 'from-blue-600 to-indigo-700'} py-16 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="md:flex md:items-center md:justify-between"
          >
            <div className="md:w-1/2">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-4xl font-extrabold text-white mb-4"
              >
                Discover Your Dream Career
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-xl text-blue-100 mb-6"
              >
                Explore opportunities that match your skills and aspirations
              </motion.p>
              
              {/* AI Auto Apply Feature Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg mb-8"
              >
                <span className="mr-2 text-xl">✨</span>
                <span>AI Auto Apply</span>
                <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-xs rounded-full font-semibold">COMING SOON</span>
              </motion.div>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="md:w-1/2 mt-8 md:mt-0 flex justify-center"
            >
              <motion.div 
                animate={{ 
                  y: [0, -15, 0],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3,
                  ease: "easeInOut" 
                }}
                className="w-48 h-48 relative"
              >
                <BriefcaseIcon className="w-full h-full text-white/20" />
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Search and filter box with glassmorphism */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={`${isDarkMode ? 
              'bg-gray-800/40 backdrop-blur-xl border border-gray-700/50' : 
              'bg-white/90 backdrop-blur-xl border border-white/50'} 
              rounded-xl shadow-lg p-4 mt-8 transition-all duration-300`}
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search input */}
              <div className="flex-grow relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <input
                  type="text"
                  placeholder="Search job titles, companies, or skills"
                  className={`pl-10 w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${isDarkMode ? 
                    'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' : 
                    'bg-white border-gray-200 text-gray-900 placeholder-gray-500'}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              {/* Filter button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition duration-200 ${isDarkMode ? 
                  'bg-blue-600 hover:bg-blue-700 text-white' : 
                  'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                <span>Filters</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
              </motion.button>
            </div>
            
            {/* Expandable filter sections with animation */}
            <Transition
              show={isFilterOpen}
              enter="transition duration-200 ease-out"
              enterFrom="opacity-0 -translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="transition duration-150 ease-in"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 -translate-y-4"
            >
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Location filter */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Location
                  </label>
                  <select
                    className={`w-full p-2 rounded-md focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 
                      'bg-gray-700 border-gray-600 text-white' : 
                      'bg-white border-gray-300 text-gray-700'}`}
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    {locationFilters.map((location) => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
                
                {/* Job Type filter */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Job Type
                  </label>
                  <select
                    className={`w-full p-2 rounded-md focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 
                      'bg-gray-700 border-gray-600 text-white' : 
                      'bg-white border-gray-300 text-gray-700'}`}
                    value={selectedJobType}
                    onChange={(e) => setSelectedJobType(e.target.value)}
                  >
                    {jobTypeFilters.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                {/* Experience Level filter */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Experience Level
                  </label>
                  <select
                    className={`w-full p-2 rounded-md focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 
                      'bg-gray-700 border-gray-600 text-white' : 
                      'bg-white border-gray-300 text-gray-700'}`}
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                  >
                    {experienceLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Advanced Filters Button */}
              <div className="mt-4 flex justify-center">
                <button 
                  onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                  className={`text-sm flex items-center gap-1 px-3 py-1 rounded-full ${isDarkMode ? 
                    'text-blue-400 hover:bg-gray-800' : 
                    'text-blue-600 hover:bg-blue-50'}`}
                >
                  <span>{isAdvancedFilterOpen ? 'Hide Advanced Filters' : 'Show Advanced Filters'}</span>
                  <ChevronDownIcon className={`h-3 w-3 transition-transform duration-200 ${isAdvancedFilterOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {/* Advanced Filters */}
              <Transition
                show={isAdvancedFilterOpen}
                enter="transition duration-200 ease-out"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition duration-150 ease-in"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Salary Range filter */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Salary Range
                    </label>
                    <select
                      className={`w-full p-2 rounded-md focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 
                        'bg-gray-700 border-gray-600 text-white' : 
                        'bg-white border-gray-300 text-gray-700'}`}
                      value={selectedSalary}
                      onChange={(e) => setSelectedSalary(e.target.value)}
                    >
                      {salaryRanges.map((range) => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Company Size filter */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Company Size
                    </label>
                    <select
                      className={`w-full p-2 rounded-md focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 
                        'bg-gray-700 border-gray-600 text-white' : 
                        'bg-white border-gray-300 text-gray-700'}`}
                      value={selectedCompanySize}
                      onChange={(e) => setSelectedCompanySize(e.target.value)}
                    >
                      {companySizes.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </Transition>
              
              {/* Clear Filters button */}
              <div className="mt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={clearFilters}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${isDarkMode ? 
                    'bg-gray-700 hover:bg-gray-600 text-white' : 
                    'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                >
                  Clear All Filters
                </motion.button>
              </div>
            </Transition>
          </motion.div>
        </div>
      </div>

      {/* AI Auto Apply Feature Card */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={`rounded-lg shadow-lg overflow-hidden border ${isDarkMode ? 'border-purple-800 bg-gray-800' : 'border-purple-200 bg-white'} mb-8`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
                  <span className="text-2xl">✨</span>
                </div>
                <div className="ml-4">
                  <h3 className={`text-xl font-bold flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    AI Auto Apply
                    <span className="ml-3 px-3 py-1 bg-yellow-500 text-xs rounded-full font-semibold text-yellow-900">COMING SOON</span>
                  </h3>
                  <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Let AI handle your job applications automatically
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-md cursor-not-allowed opacity-80"
                disabled
              >
                Get Notified When Available
              </motion.button>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Automated Applications</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>AI will automatically apply to jobs that match your skills and preferences, saving you countless hours.</p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Custom Cover Letters</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Generate tailored cover letters for each position based on your resume and the job description.</p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Application Tracking</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Monitor all your applications in one place with status updates and follow-up reminders.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
        
      {/* Job listings section */}
      <div className="container mx-auto px-4 py-8">
        {/* Results count and filter summary */}
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div>
            <span className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
              {filteredJobs.length} jobs found
            </span>
            {(selectedLocation !== 'All Locations' || 
              selectedJobType !== 'All Types' || 
              selectedExperience !== 'All Levels' || 
              selectedSalary !== 'All Ranges' || 
              selectedCompanySize !== 'All Sizes' || 
              searchTerm !== '') && (
              <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                with applied filters
              </span>
            )}
          </div>
          <div className="flex items-center mt-2 sm:mt-0 space-x-4">
            {/* View mode toggle */}
            <div className={`flex rounded-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-blue-700' : 
                  isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}
                aria-label="Grid view"
              >
                <ViewColumnsIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-blue-700' : 
                  isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}
                aria-label="List view"
              >
                <Bars4Icon className="h-5 w-5" />
              </button>
            </div>
            
            {/* Filter clear button (only show when filters are applied) */}
            {(selectedLocation !== 'All Locations' || 
              selectedJobType !== 'All Types' || 
              selectedExperience !== 'All Levels' || 
              selectedSalary !== 'All Ranges' || 
              selectedCompanySize !== 'All Sizes' || 
              searchTerm !== '') && (
              <button
                onClick={clearFilters}
                className={`text-sm flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Job cards with animation */}
        {filteredJobs.length > 0 ? (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className={viewMode === 'grid' ? 
              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 
              'space-y-6'}
          >
            {filteredJobs.map(job => (
              <motion.div
                key={job.id}
                variants={cardVariants}
                whileHover="hover"
                className={`${isDarkMode ? 
                  'bg-gray-800/60 backdrop-blur-sm border border-gray-700/50' : 
                  'bg-white/90 backdrop-blur-sm border border-gray-200/70'} 
                  rounded-xl overflow-hidden shadow-md transition-all duration-300 ${job.featured ? 
                    isDarkMode ? 'ring-2 ring-blue-500/50' : 'ring-2 ring-blue-500/30' 
                  : ''}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold" 
                        style={{ backgroundColor: job.color }}
                      >
                        {job.initials}
                      </div>
                      <div>
                        <div className="flex items-center">
                          {job.featured && (
                            <span className="inline-flex items-center mr-2 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              <StarIcon className="h-3 w-3 mr-1" />
                              Featured
                            </span>
                          )}
                          {job.isNew && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              New
                            </span>
                          )}
                        </div>
                        <h3 className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {job.title}
                        </h3>
                        <div className="flex items-center text-sm">
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{job.company}</span>
                          <span className="mx-2">•</span>
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{job.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => toggleSaveJob(job.id, e)}
                      className={`${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-400 hover:text-blue-500'}`}
                      aria-label={savedJobs.includes(job.id) ? "Unsave job" : "Save job"}
                    >
                      {savedJobs.includes(job.id) ? (
                        <HeartIconSolid className="h-5 w-5 text-red-500" />
                      ) : (
                        <HeartIconOutline className="h-5 w-5" />
                      )}
                    </motion.button>
                  </div>

                  {/* Job details */}
                  <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {job.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className={`px-2 py-1 rounded-md text-xs font-medium ${isDarkMode ? 
                          'bg-gray-700 text-blue-300' : 
                          'bg-blue-50 text-blue-700'}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Job metadata */}
                  <div className={`flex items-center justify-between mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center">
                        <BriefcaseIcon className="h-4 w-4 mr-1" />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>{job.jobType}</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>{job.postedDate}</span>
                      </div>
                    </div>
                    <div className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>{job.salary}</div>
                  </div>

                  {/* Company details */}
                  <div className={`flex items-center justify-between mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>{job.companySize} employees</span>
                      </div>
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>{job.experience}</span>
                      </div>
                    </div>
                  </div>

                  {/* Apply button and share */}
                  <div className="mt-6 flex gap-2">
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href="#"
                      className={`flex-1 block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-center transition-all duration-200`}
                      onClick={(e) => e.preventDefault()}
                    >
                      Apply Now
                    </motion.a>
                    <button className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      <ShareIcon className="h-5 w-5" />
                    </button>
                    <button className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      <BookmarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${isDarkMode ? 
              'bg-gray-800 text-gray-200' : 
              'bg-white text-gray-800'} rounded-lg shadow-md p-12 text-center max-w-lg mx-auto`}
          >
            <div className={`mx-auto w-16 h-16 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mb-4`}>
              <BuildingOfficeIcon className={`h-8 w-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <h3 className="text-xl font-medium mb-2">No matching jobs found</h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
              Try adjusting your search terms or filters to find more opportunities.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={clearFilters}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Reset Filters
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
