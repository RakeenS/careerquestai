import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Copy, Download, RefreshCw } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface OptimizationResultsProps {
  results: {
    summary: string;
    recommendations: string[];
    optimizedContent: {
      headline: string;
      about: string;
      experience: string[];
      skills: string[];
    };
  };
  onClose: () => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

const OptimizationResults: React.FC<OptimizationResultsProps> = ({ 
  results, 
  onClose, 
  onRegenerate, 
  isRegenerating = false 
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadResults = () => {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Set font styles
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('LinkedIn Profile Optimization Results', 20, 20);
    
    // Add summary section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary:', 20, 30);
    doc.setFont('helvetica', 'normal');
    
    // Handle long text wrapping for summary
    const summaryLines = doc.splitTextToSize(results.summary, 170);
    doc.text(summaryLines, 20, 35);
    
    // Add recommendations section
    let yPosition = 35 + (summaryLines.length * 5);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Recommendations:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    
    yPosition += 5;
    results.recommendations.forEach((rec, index) => {
      const recLines = doc.splitTextToSize(`${index + 1}. ${rec}`, 170);
      doc.text(recLines, 20, yPosition);
      yPosition += (recLines.length * 5);
    });
    
    // Add optimized content section
    doc.setFont('helvetica', 'bold');
    doc.text('Optimized Content:', 20, yPosition);
    yPosition += 5;
    
    // Add headline
    doc.setFont('helvetica', 'bold');
    doc.text('Professional Headline:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 5;
    const headlineLines = doc.splitTextToSize(results.optimizedContent.headline, 170);
    doc.text(headlineLines, 20, yPosition);
    yPosition += (headlineLines.length * 5);
    
    // Check if we need a new page for the About section
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Add about section
    doc.setFont('helvetica', 'bold');
    doc.text('About Section:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 5;
    const aboutLines = doc.splitTextToSize(results.optimizedContent.about, 170);
    doc.text(aboutLines, 20, yPosition);
    yPosition += (aboutLines.length * 5);
    
    // Check if we need a new page for the Experience section
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Add experience section
    doc.setFont('helvetica', 'bold');
    doc.text('Experience Highlights:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 5;
    
    results.optimizedContent.experience.forEach((exp, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      const expLines = doc.splitTextToSize(`${index + 1}. ${exp}`, 170);
      doc.text(expLines, 20, yPosition);
      yPosition += (expLines.length * 5);
    });
    
    // Check if we need a new page for the Skills section
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Add skills section
    doc.setFont('helvetica', 'bold');
    doc.text('Recommended Skills:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 5;
    const skillsText = results.optimizedContent.skills.join(', ');
    const skillsLines = doc.splitTextToSize(skillsText, 170);
    doc.text(skillsLines, 20, yPosition);
    
    // Add a footer with date
    const today = new Date();
    const dateStr = today.toLocaleDateString();
    doc.setFontSize(8);
    doc.text(`Generated on ${dateStr} | Resume Builder LinkedIn Optimizer`, 20, 285);
    
    // Save the PDF
    doc.save('linkedin-optimization-results.pdf');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold">Profile Optimization Results</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-semibold mb-3">Summary</h3>
          <p className="text-gray-700 dark:text-gray-300">{results.summary}</p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Key Recommendations</h3>
          <ul className="space-y-2">
            {results.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <Check className="text-green-500 mr-2 mt-1 flex-shrink-0" size={18} />
                <span className="text-gray-700 dark:text-gray-300">{rec}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Optimized Content</h3>
          
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">Professional Headline</h4>
                <button
                  onClick={() => copyToClipboard(results.optimizedContent.headline)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{results.optimizedContent.headline}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">About Section</h4>
                <button
                  onClick={() => copyToClipboard(results.optimizedContent.about)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{results.optimizedContent.about}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">Experience Highlights</h4>
                <button
                  onClick={() => copyToClipboard(results.optimizedContent.experience.join('\n\n'))}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Copy size={18} />
                </button>
              </div>
              {results.optimizedContent.experience.map((exp, index) => (
                <p key={index} className="text-gray-700 dark:text-gray-300 mb-2">{exp}</p>
              ))}
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">Recommended Skills</h4>
                <button
                  onClick={() => copyToClipboard(results.optimizedContent.skills.join(', '))}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Copy size={18} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {results.optimizedContent.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end space-x-4 mt-8">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className={`flex items-center px-4 py-2 ${isRegenerating ? 'bg-blue-400' : 'bg-blue-600'} text-white rounded-lg hover:bg-blue-700`}
            >
              <RefreshCw className={`mr-2 ${isRegenerating ? 'animate-spin' : ''}`} size={18} />
              {isRegenerating ? 'Regenerating...' : 'Regenerate'}
            </button>
          )}
          <button
            onClick={downloadResults}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="mr-2" size={18} />
            Download Results
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default OptimizationResults;