import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, Check, X, ChevronRight, Star, Search, Filter } from 'lucide-react';

interface TemplateBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: { id: string; name: string; component: React.ComponentType<any> }[];
  selectedTemplate: string;
  setSelectedTemplate: (id: string) => void;
  onApply: () => void;
  customizationOptions: any;
}

const TemplateBrowserModal: React.FC<TemplateBrowserModalProps> = ({ 
  isOpen, 
  onClose, 
  templates, 
  selectedTemplate, 
  setSelectedTemplate, 
  onApply, 
  customizationOptions 
}) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const categories = ['All', 'Modern', 'Professional', 'Creative', 'Minimalist', 'Classic'];
  
  // Map templates to categories for filtering
  const templateCategories: Record<string, string[]> = {
    'modern': ['Modern', 'Professional'],
    'classic': ['Classic', 'Professional'],
    'compact': ['Minimalist', 'Professional'],
    'elegant': ['Classic', 'Professional'],
    'creative': ['Creative', 'Modern'],
    'minimalist': ['Minimalist'],
    'professional': ['Professional', 'Modern'],
  };
  
  // Map templates to popularity ratings (for UI purposes)
  const templatePopularity: Record<string, number> = {
    'modern': 4.9,
    'professional': 4.8,
    'minimalist': 4.7,
    'classic': 4.5,
    'elegant': 4.6,
    'creative': 4.4,
    'compact': 4.3,
  };
  
  // Filter templates based on selected category and search term
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = activeCategory === 'All' || 
      (templateCategories[template.id] && templateCategories[template.id].includes(activeCategory));
    
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.07,
        delayChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const templateVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 15 } },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Modern glass-like backdrop with enhanced blur and gradients */}
          <motion.div 
            className="absolute inset-0 backdrop-blur-xl"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ 
              opacity: 1, 
              backdropFilter: "blur(16px)",
              transition: { duration: 0.4 }
            }}
            exit={{ 
              opacity: 0, 
              backdropFilter: "blur(0px)",
              transition: { duration: 0.3 }
            }}
            onClick={onClose}
          >
            {/* Rich gradient overlay with depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/85 to-gray-900/90"></div>
            
            {/* Animated floating particles/shapes for visual interest */}
            <motion.div 
              className="absolute top-1/4 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
              animate={{ 
                x: [0, 10, -5, 8, 0],
                y: [0, -8, 5, -10, 0],
                scale: [1, 1.05, 0.98, 1.02, 1],
                rotate: [0, 5, -3, 2, 0]
              }}
              transition={{ 
                duration: 15, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            ></motion.div>
            <motion.div 
              className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
              animate={{ 
                x: [0, -15, 8, -5, 0],
                y: [0, 10, -8, 12, 0],
                scale: [1, 0.95, 1.05, 0.98, 1],
                rotate: [0, -3, 5, -2, 0]
              }}
              transition={{ 
                duration: 18, 
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1 
              }}
            ></motion.div>
            <motion.div 
              className="absolute top-1/2 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl"
              animate={{ 
                x: [0, 12, -10, 5, 0],
                y: [0, -12, 8, -5, 0],
                scale: [1, 1.08, 0.95, 1.04, 1],
                rotate: [0, 8, -5, 3, 0]
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity,
                repeatType: "reverse",
                delay: 2 
              }}
            ></motion.div>
          </motion.div>

          <motion.div
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-200/50 dark:border-gray-700/50 flex flex-col"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              transition: {
                type: "spring",
                damping: 30,
                stiffness: 300,
                delay: 0.15
              }
            }}
            exit={{ 
              scale: 0.95, 
              opacity: 0, 
              y: 10,
              transition: {
                duration: 0.2,
                ease: "easeInOut"
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient accent at top of modal */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            
            {/* Header section with better spacing */}
            <div className="flex justify-between items-center p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
                <div className="mr-4 flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                  <Layout className="h-6 w-6" />
                </div>
                <div>
                  <span>Template Gallery</span>
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                    {templates.length} options
                  </span>
                </div>
              </h2>
              
              {/* Improved close button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                aria-label="Close template browser"
              >
                <X size={24} />
              </motion.button>
            </div>

            <div className="p-6 lg:p-8 flex-1 overflow-hidden flex flex-col">
              {/* Enhanced search and filters row */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                {/* Improved search bar */}
                <div className={`relative flex-grow max-w-md transition-all duration-200 ${isSearchFocused ? 'ring-2 ring-blue-500 rounded-xl shadow-lg' : 'shadow-md'}`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  {searchTerm && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setSearchTerm('')}
                    >
                      <X size={18} className="text-gray-400 hover:text-gray-600" />
                    </motion.button>
                  )}
                </div>
                
                {/* Improved view toggle & filtering */}
                <div className="flex space-x-3">
                  <div className="flex p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2.5 rounded-md transition-all duration-200 ${
                        viewMode === 'grid' 
                          ? 'bg-white dark:bg-gray-600 shadow-sm' 
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-650'
                      }`}
                      aria-label="Grid view"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2.5 rounded-md transition-all duration-200 ${
                        viewMode === 'list' 
                          ? 'bg-white dark:bg-gray-600 shadow-sm' 
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-650'
                      }`}
                      aria-label="List view"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <button className="flex items-center px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors shadow-sm">
                    <Filter className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Filter</span>
                  </button>
                </div>
              </div>
              
              {/* Improved category pills with better spacing */}
              <div className="flex mb-8 overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex space-x-3">
                  {categories.map((category) => (
                    <motion.button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                        category === activeCategory 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm'
                      }`}
                      whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                      whileTap={{ y: 0 }}
                    >
                      {category}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Templates grid/list */}
              <div className="overflow-y-auto flex-1 pr-2">
                {filteredTemplates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">No templates found</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                      We couldn't find any templates matching your search criteria. Try adjusting your filters or search term.
                    </p>
                  </div>
                ) : viewMode === 'grid' ? (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {filteredTemplates.map((template) => (
                      <motion.div 
                        key={template.id}
                        className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent"
                        style={{ 
                          borderColor: selectedTemplate === template.id ? '#3B82F6' : 'transparent',
                          boxShadow: selectedTemplate === template.id ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : ''
                        }}
                        onClick={() => setSelectedTemplate(template.id)}
                        variants={templateVariants}
                        whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                      >
                        {/* Top bar showing template name */}
                        <div className="relative z-10 flex justify-between items-center px-5 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{template.name}</h3>
                          <div className="flex items-center bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1.5" />
                            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">{templatePopularity[template.id]}</span>
                          </div>
                        </div>
                        
                        {/* Template Preview */}
                        <div className="aspect-[3/4] overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 relative">
                          {/* Template Preview */}
                          <div className="absolute inset-0 flex items-center justify-center p-4 transition-all duration-300 transform group-hover:scale-105">
                            <div className="h-full w-full max-w-[180px] mx-auto relative bg-white dark:bg-gray-800 rounded shadow-lg" 
                              style={{ fontFamily: customizationOptions.fontFamily }}
                            >
                              {/* Header/Personal Info */}
                              <div className="text-center pt-5 pb-3 px-3" style={{ 
                                borderBottom: `2px solid ${customizationOptions.primaryColor}`,
                                background: template.id === 'modern' || template.id === 'professional' 
                                  ? `linear-gradient(to right, ${customizationOptions.primaryColor}15, ${customizationOptions.primaryColor}10)`
                                  : 'transparent'
                              }}>
                                <div className="text-xs font-bold mb-1" style={{ color: customizationOptions.primaryColor }}>John Doe</div>
                                <div className="text-[8px] font-medium mb-1" style={{ color: customizationOptions.secondaryColor }}>Software Engineer</div>
                                <div className="flex justify-center space-x-1 text-[6px] text-gray-600 dark:text-gray-400">
                                  <span>email@example.com</span>
                                  <span>•</span>
                                  <span>(123) 456-7890</span>
                                </div>
                              </div>

                              {/* Sections based on template style */}
                              <div className="px-2 pt-2 pb-3 text-[6px] space-y-2">
                                {/* Summary */}
                                <div>
                                  <div className="text-[7px] font-bold mb-1 pb-0.5" style={{ 
                                    color: customizationOptions.secondaryColor,
                                    borderBottom: template.id === 'classic' || template.id === 'elegant' ? `1px solid ${customizationOptions.secondaryColor}` : 'none'
                                  }}>PROFESSIONAL SUMMARY</div>
                                  <div className="text-gray-700 dark:text-gray-300 leading-tight">
                                    Experienced software engineer with expertise in web development.
                                  </div>
                                </div>

                                {/* Experience */}
                                <div>
                                  <div className="text-[7px] font-bold mb-1 pb-0.5" style={{ 
                                    color: customizationOptions.secondaryColor,
                                    borderBottom: template.id === 'classic' || template.id === 'elegant' ? `1px solid ${customizationOptions.secondaryColor}` : 'none'
                                  }}>EXPERIENCE</div>
                                  
                                  <div className="mb-1">
                                    <div className="flex justify-between">
                                      <span className="font-medium" style={{ color: customizationOptions.primaryColor }}>Senior Developer</span>
                                      <span className="text-gray-600 dark:text-gray-400">2020-Present</span>
                                    </div>
                                    <div className="font-medium text-gray-700 dark:text-gray-300">Tech Company</div>
                                  </div>
                                </div>

                                {/* Education */}
                                <div>
                                  <div className="text-[7px] font-bold mb-1 pb-0.5" style={{ 
                                    color: customizationOptions.secondaryColor,
                                    borderBottom: template.id === 'classic' || template.id === 'elegant' ? `1px solid ${customizationOptions.secondaryColor}` : 'none'
                                  }}>EDUCATION</div>
                                  <div className="mb-0.5">
                                    <div className="flex justify-between">
                                      <span className="font-medium" style={{ color: customizationOptions.primaryColor }}>BS Computer Science</span>
                                      <span className="text-gray-600 dark:text-gray-400">2016</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Enhanced hover overlay with action button */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                            <motion.button
                              className="px-5 py-2.5 bg-white text-blue-600 rounded-full font-medium text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                              whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.2)" }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTemplate(template.id);
                                onApply();
                              }}
                            >
                              Apply Template
                            </motion.button>
                          </div>
                        </div>
                        
                        {/* Bottom info bar with better styling */}
                        <div className="px-5 py-4 bg-white dark:bg-gray-800 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {template.id === 'modern' && 'Clean, contemporary design'}
                            {template.id === 'classic' && 'Traditional, structured layout'}
                            {template.id === 'compact' && 'Space-efficient format'}
                            {template.id === 'elegant' && 'Sophisticated, refined style'}
                            {template.id === 'creative' && 'Unique, eye-catching design'}
                            {template.id === 'minimalist' && 'Simple, focused presentation'}
                            {template.id === 'professional' && 'Polished, corporate appearance'}
                          </p>
                          
                          {/* Enhanced status indicator */}
                          {selectedTemplate === template.id && (
                            <motion.div 
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ type: "spring", damping: 8 }}
                            >
                              Selected
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    className="space-y-5"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {filteredTemplates.map((template) => (
                      <motion.div
                        key={template.id}
                        className={`flex items-center gap-6 p-5 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedTemplate === template.id 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-600 shadow-md'
                            : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border-2 border-transparent shadow-sm hover:shadow-md'
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                        variants={templateVariants}
                        whileHover={{ y: -2 }}
                      >
                        {/* Small thumbnail with improved styling */}
                        <div className="h-20 w-20 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-700">
                          <div className="transform scale-[0.6] w-full h-full bg-white dark:bg-gray-800 flex items-center justify-center">
                            <div className="w-12 h-12" style={{ color: customizationOptions.primaryColor }}>
                              {template.id === 'modern' && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V8H16V4H3Z" /><path d="M16 11H8V9H16V11Z" /><path d="M16 15H8V13H16V15Z" /></svg>}
                              {template.id === 'classic' && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3Z" /><path d="M8 17V12H6V10H12V12H10V17H8Z" /><path d="M14 17V10H17C17.5304 10 18.0391 10.2107 18.4142 10.5858C18.7893 10.9609 19 11.4696 19 12V15C19 15.5304 18.7893 16.0391 18.4142 16.4142C18.0391 16.7893 17.5304 17 17 17H14Z" /></svg>}
                              {template.id === 'compact' && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19Z" /><path d="M7 12H17V14H7V12Z" /><path d="M7 16H17V18H7V16Z" /><path d="M7 8H17V10H7V8Z" /></svg>}
                              {template.id === 'elegant' && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4L4 4.00002V16L20 16.0001V4Z" /><path d="M4 18.0001H20V20.0001H4V18.0001Z" /></svg>}
                              {template.id === 'creative' && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21 8C21 6.34315 19.6569 5 18 5H6C4.34315 5 3 6.34315 3 8V16C3 17.6569 4.34315 19 6 19H18C19.6569 19 21 17.6569 21 16V8Z" /><path d="M12 7V17" /><path d="M8 9V15" /><path d="M16 9V15" /></svg>}
                              {template.id === 'minimalist' && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4H20V20H4V4Z" /><path d="M8 9H16" /><path d="M8 12H16" /><path d="M8 15H12" /></svg>}
                              {template.id === 'professional' && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 3H20C21.1046 3 22 3.89543 22 5V19C22 20.1046 21.1046 21 20 21H4C2.89543 21 2 20.1046 2 19V5C2 3.89543 2.89543 3 4 3Z" /><path d="M9 9H4V12H9V9Z" /><path d="M9 14H4V17H9V14Z" /><path d="M20 9H11V12H20V9Z" /><path d="M20 14H11V17H20V14Z" /></svg>}
                            </div>
                          </div>
                        </div>
                        
                        {/* Template info with improved layout */}
                        <div className="flex-grow flex flex-col">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{template.name}</h3>
                            <div className="flex items-center bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                              <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1" />
                              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">{templatePopularity[template.id]}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            {template.id === 'modern' && 'Clean, contemporary design with a focus on readability and modern aesthetics.'}
                            {template.id === 'classic' && 'Traditional, structured layout with a timeless professional appearance.'}
                            {template.id === 'compact' && 'Space-efficient format for maximizing content without sacrificing clarity.'}
                            {template.id === 'elegant' && 'Sophisticated, refined style with balanced typography and spacing.'}
                            {template.id === 'creative' && 'Unique, eye-catching design for standing out in creative industries.'}
                            {template.id === 'minimalist' && 'Simple, focused presentation that highlights essentials with minimal distraction.'}
                            {template.id === 'professional' && 'Polished, corporate appearance ideal for established industries.'}
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {templateCategories[template.id]?.map(cat => (
                              <span key={cat} className="inline-block text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* Action button with improved styling */}
                        <motion.button
                          className={`px-5 py-2.5 rounded-xl text-sm font-medium shadow-md ${
                            selectedTemplate === template.id
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTemplate(template.id);
                            onApply();
                          }}
                        >
                          {selectedTemplate === template.id ? 'Selected' : 'Apply Template'}
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Improved footer with consistent buttons */}
              <div className="sticky bottom-0 flex justify-between p-6 lg:p-8 gap-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850">
                <motion.button
                  onClick={onClose}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm font-medium"
                  whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}
                  whileTap={{ y: 0 }}
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    onApply();
                    onClose();
                  }}
                  className="px-8 py-3 rounded-xl text-white font-medium shadow-lg flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                  whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.15)" }}
                  whileTap={{ y: 0 }}
                >
                  <span>Apply Template</span>
                  <ChevronRight size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TemplateBrowserModal; 