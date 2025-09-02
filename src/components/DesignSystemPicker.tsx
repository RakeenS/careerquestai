import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Square, Type, Shuffle, SlidersHorizontal, Palette } from 'lucide-react';

// Types for customization options
interface CustomizationOptions {
  primaryColor: string;
  secondaryColor: string;
  fontSize: string;
  lineSpacing: string;
  fontFamily: string;
  spacing: string;
}

interface DesignSystemPickerProps {
  options: CustomizationOptions;
  onChange: (newOptions: CustomizationOptions) => void;
}

const DesignSystemPicker: React.FC<DesignSystemPickerProps> = ({ options, onChange }) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing'>('colors');

  // Pre-defined color palettes for professional resumes
  const colorPalettes = [
    { primary: '#0077B5', secondary: '#000000' }, // LinkedIn Blue & Black
    { primary: '#2563EB', secondary: '#1E293B' }, // Royal Blue & Dark Slate
    { primary: '#15803D', secondary: '#1E293B' }, // Forest Green & Dark Slate
    { primary: '#9333EA', secondary: '#1E293B' }, // Purple & Dark Slate
    { primary: '#DC2626', secondary: '#1E293B' }, // Red & Dark Slate
    { primary: '#0E7490', secondary: '#0F172A' }, // Cyan & Navy
    { primary: '#1D4ED8', secondary: '#334155' }, // Indigo & Slate
    { primary: '#4338CA', secondary: '#1E40AF' }, // Light Indigo & Indigo
    { primary: '#0369A1', secondary: '#0C4A6E' }, // Light Blue & Dark Blue
    { primary: '#000000', secondary: '#6B7280' }, // Black & Gray
    { primary: '#475569', secondary: '#0F172A' }, // Slate & Navy
    { primary: '#334155', secondary: '#64748B' }, // Dark Slate & Light Slate
  ];

  // Font family options
  const fontOptions = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif' },
    { name: 'Lato', value: 'Lato, sans-serif' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif' },
    { name: 'Raleway', value: 'Raleway, sans-serif' },
    { name: 'Playfair Display', value: 'Playfair Display, serif' },
    { name: 'Merriweather', value: 'Merriweather, serif' },
    { name: 'Source Sans Pro', value: 'Source Sans Pro, sans-serif' },
  ];

  // Font size options
  const fontSizeOptions = [
    { name: 'Small', value: 'small' },
    { name: 'Medium', value: 'medium' },
    { name: 'Large', value: 'large' },
  ];

  // Line spacing options
  const lineSpacingOptions = [
    { name: 'Tight', value: 'tight' },
    { name: 'Normal', value: 'normal' },
    { name: 'Relaxed', value: 'relaxed' },
    { name: 'Loose', value: 'loose' },
  ];

  // Spacing options
  const spacingOptions = [
    { name: 'Compact', value: 'compact' },
    { name: 'Normal', value: 'normal' },
    { name: 'Relaxed', value: 'relaxed' },
    { name: 'Spacious', value: 'spacious' },
  ];

  // Function to generate random design system
  const generateRandomDesign = () => {
    const randomColorPalette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
    const randomFont = fontOptions[Math.floor(Math.random() * fontOptions.length)].value;
    const randomFontSize = fontSizeOptions[Math.floor(Math.random() * fontSizeOptions.length)].value;
    const randomLineSpacing = lineSpacingOptions[Math.floor(Math.random() * lineSpacingOptions.length)].value;
    const randomSpacing = spacingOptions[Math.floor(Math.random() * spacingOptions.length)].value;

    const newOptions = {
      ...options,
      primaryColor: randomColorPalette.primary,
      secondaryColor: randomColorPalette.secondary,
      fontFamily: randomFont,
      fontSize: randomFontSize,
      lineSpacing: randomLineSpacing,
      spacing: randomSpacing,
    };

    onChange(newOptions);
  };

  // Animations for tab content
  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Top decorative accent */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
      
      {/* Tab navigation */}
      <div className="flex p-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850">
        <button
          onClick={() => setActiveTab('colors')}
          className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'colors' 
              ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-750'
          }`}
        >
          <Palette className="mr-2 h-4 w-4" />
          Colors
        </button>
        <button
          onClick={() => setActiveTab('typography')}
          className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'typography' 
              ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-750'
          }`}
        >
          <Type className="mr-2 h-4 w-4" />
          Typography
        </button>
        <button
          onClick={() => setActiveTab('spacing')}
          className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'spacing' 
              ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-750'
          }`}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Spacing
        </button>
      </div>
      
      <div className="p-6">
        {/* Color palette selection */}
        {activeTab === 'colors' && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={tabContentVariants}
            className="space-y-6"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Color Palette</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generateRandomDesign}
                  className="flex items-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-medium transition-colors"
                >
                  <Shuffle className="mr-1.5 h-3.5 w-3.5" />
                  Randomize
                </motion.button>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {colorPalettes.map((palette, index) => (
                  <button
                    key={index}
                    onClick={() => onChange({
                      ...options,
                      primaryColor: palette.primary,
                      secondaryColor: palette.secondary
                    })}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                      options.primaryColor === palette.primary && options.secondaryColor === palette.secondary
                        ? 'border-blue-500 dark:border-blue-400 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {options.primaryColor === palette.primary && options.secondaryColor === palette.secondary && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 mb-2 rounded-full" style={{ backgroundColor: palette.primary }}></div>
                      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: palette.secondary }}></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-lg mr-3 border border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: options.primaryColor }}
                  ></div>
                  <input
                    type="text"
                    value={options.primaryColor}
                    onChange={(e) => onChange({ ...options, primaryColor: e.target.value })}
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-lg mr-3 border border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: options.secondaryColor }}
                  ></div>
                  <input
                    type="text"
                    value={options.secondaryColor}
                    onChange={(e) => onChange({ ...options, secondaryColor: e.target.value })}
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Typography settings */}
        {activeTab === 'typography' && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={tabContentVariants}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Font Family
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {fontOptions.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => onChange({ ...options, fontFamily: font.value })}
                    className={`p-3 rounded-xl text-center border-2 transition-all duration-200 ${
                      options.fontFamily === font.value
                        ? 'border-blue-500 dark:border-blue-400 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    style={{ fontFamily: font.value }}
                  >
                    <span className="block text-lg mb-1">{font.name}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">AaBbCcDd</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Font Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {fontSizeOptions.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => onChange({ ...options, fontSize: size.value })}
                      className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                        options.fontSize === size.value
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-650'
                      }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Line Spacing
                </label>
                <div className="flex flex-wrap gap-2">
                  {lineSpacingOptions.map((spacing) => (
                    <button
                      key={spacing.value}
                      onClick={() => onChange({ ...options, lineSpacing: spacing.value })}
                      className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                        options.lineSpacing === spacing.value
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-650'
                      }`}
                    >
                      {spacing.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Preview</h4>
              <div 
                className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
                style={{ 
                  fontFamily: options.fontFamily,
                  lineHeight: options.lineSpacing === 'tight' ? 1.2 :
                             options.lineSpacing === 'normal' ? 1.5 :
                             options.lineSpacing === 'relaxed' ? 1.8 : 2
                }}
              >
                <h3 
                  className="font-bold mb-2"
                  style={{ 
                    color: options.primaryColor,
                    fontSize: options.fontSize === 'small' ? '1rem' :
                              options.fontSize === 'medium' ? '1.25rem' : '1.5rem'
                  }}
                >
                  Sample Heading
                </h3>
                <p 
                  className="text-gray-700 dark:text-gray-300"
                  style={{ 
                    fontSize: options.fontSize === 'small' ? '0.875rem' :
                              options.fontSize === 'medium' ? '1rem' : '1.125rem'
                  }}
                >
                  This is a sample text that demonstrates how your typography settings will look on your resume.
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Spacing settings */}
        {activeTab === 'spacing' && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={tabContentVariants}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Element Spacing
              </label>
              <div className="grid grid-cols-2 gap-3">
                {spacingOptions.map((spacing) => (
                  <button
                    key={spacing.value}
                    onClick={() => onChange({ ...options, spacing: spacing.value })}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                      options.spacing === spacing.value
                        ? 'border-blue-500 dark:border-blue-400 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {options.spacing === spacing.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    
                    <div className="flex flex-col items-center">
                      {/* Visual representation of spacing */}
                      <div className="w-full flex flex-col items-center">
                        <div className="w-full h-3 bg-blue-200 dark:bg-blue-900 rounded mb-1"></div>
                        <div className="w-full h-3 bg-blue-200 dark:bg-blue-900 rounded mb-1" style={{
                          marginTop: spacing.value === 'compact' ? '2px' :
                                    spacing.value === 'normal' ? '6px' :
                                    spacing.value === 'relaxed' ? '10px' : '14px'
                        }}></div>
                        <div className="w-full h-3 bg-blue-200 dark:bg-blue-900 rounded" style={{
                          marginTop: spacing.value === 'compact' ? '2px' :
                                    spacing.value === 'normal' ? '6px' :
                                    spacing.value === 'relaxed' ? '10px' : '14px'
                        }}></div>
                      </div>
                      <span className="block mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {spacing.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Spacing Preview</h4>
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">Section Title</h3>
                </div>
                <div className="p-4">
                  <div 
                    className="space-y-2"
                    style={{ 
                      gap: options.spacing === 'compact' ? '0.5rem' :
                            options.spacing === 'normal' ? '1rem' :
                            options.spacing === 'relaxed' ? '1.5rem' : '2rem',
                      display: 'grid'
                    }}
                  >
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                      Item 1
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                      Item 2
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                      Item 3
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DesignSystemPicker; 