import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Edit, Eye } from 'lucide-react';
import PDFViewer from './PDFViewer';
import ModernResumeTemplate from './ModernResumeTemplate';
import ClassicResumeTemplate from './ClassicResumeTemplate';
import CompactResumeTemplate from './CompactResumeTemplate';
import ElegantResumeTemplate from './ElegantResumeTemplate';
import CreativeResumeTemplate from './CreativeResumeTemplate';
import MinimalistResumeTemplate from './MinimalistResumeTemplate';
import ProfessionalResumeTemplate from './ProfessionalResumeTemplate';

interface ResumeViewerProps {
  resumeId: string;
  name: string;
  fileUrl: string;
  resumeContent: string | null;
  resume: any; // Full resume object with template and style information
}

const ResumeViewer: React.FC<ResumeViewerProps> = ({ 
  resumeId, 
  name, 
  fileUrl, 
  resumeContent,
  resume
}) => {
  const [viewMode, setViewMode] = useState<'text' | 'pdf' | 'styled'>('styled');

  // Select the appropriate template component based on templateId
  const renderTemplate = () => {
    if (!resume) return null;
    
    // Ensure customization options are in the expected format
    const customizationOptions = {
      primaryColor: resume.customization?.primaryColor || '#0077B5',
      secondaryColor: resume.customization?.secondaryColor || '#000000',
      fontSize: resume.customization?.fontSize || 'medium',
      lineSpacing: resume.customization?.lineSpacing || 'normal'
    };
    
    // Templates that accept customizationOptions prop
    switch (resume.templateId) {
      case 'modern':
        return <ModernResumeTemplate content={resume} customizationOptions={customizationOptions} />;
      case 'elegant':
        return <ElegantResumeTemplate content={resume} customizationOptions={customizationOptions} />;
      case 'compact':
        return <CompactResumeTemplate content={resume} customizationOptions={customizationOptions} />;
      
      // Templates that don't use customizationOptions in their interface
      case 'classic':
        return <ClassicResumeTemplate content={resume} />;
      case 'creative':
        return <CreativeResumeTemplate content={resume} />;
      case 'minimalist':
        return <MinimalistResumeTemplate content={resume} />;
      case 'professional':
        return <ProfessionalResumeTemplate content={resume} />;
      
      // Default case
      default:
        return <ModernResumeTemplate content={resume} customizationOptions={customizationOptions} />;
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-gray-800 dark:text-gray-200 text-center w-full">
        <div className="flex items-center justify-center space-x-4">
          <button 
            onClick={() => setViewMode('styled')}
            className={`px-4 py-2 rounded-md transition-colors ${viewMode === 'styled' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
          >
            View Styled Resume
          </button>
          <button 
            onClick={() => setViewMode('text')}
            className={`px-4 py-2 rounded-md transition-colors ${viewMode === 'text' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
          >
            View Extracted Text
          </button>
          {fileUrl && (
            <button 
              onClick={() => setViewMode('pdf')}
              className={`px-4 py-2 rounded-md transition-colors ${viewMode === 'pdf' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
            >
              View PDF
            </button>
          )}
        </div>
      </div>
      
      <div className="w-full flex flex-col space-y-5">
        {viewMode === 'pdf' && fileUrl ? (
          // Display PDF directly using PDFViewer component
          <div className="w-full h-[70vh] border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
            <PDFViewer fileUrl={fileUrl} />
          </div>
        ) : viewMode === 'text' ? (
          // Display extracted text content
          resumeContent ? (
            <div className="w-full h-[70vh] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 p-6">
              <div className="prose dark:prose-invert max-w-none">
                {/* Format the extracted content with paragraphs and line breaks */}
                {resumeContent.split('\n\n').map((paragraph, idx) => (
                  paragraph.trim() ? (
                    <p key={idx} className="mb-3 text-gray-800 dark:text-gray-200">
                      {paragraph.split('\n').map((line, lineIdx) => (
                        <React.Fragment key={lineIdx}>
                          {line}
                          {lineIdx < paragraph.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </p>
                  ) : null
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="mx-auto mb-4 text-gray-400 dark:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <line x1="10" y1="9" x2="8" y2="9"/>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">Resume Content Unavailable</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                We couldn't extract text from this resume file. This can happen with certain PDF formats or if the PDF contains mainly images.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                {fileUrl && (
                  <button
                    onClick={() => setViewMode('pdf')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" /> View as PDF
                  </button>
                )}
                <Link
                  to={`/build?resumeId=${resumeId}`}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors inline-flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-2" /> Edit in Builder
                </Link>
              </div>
            </div>
          )
        ) : (
          // Display styled resume with template
          <div className="w-full h-[70vh] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
            <div id="resume-styled-preview" className="print:shadow-none h-full w-full flex flex-col">
              {renderTemplate()}
            </div>
          </div>
        )}
        
        <div className="flex justify-between">
          {fileUrl ? (
            <a 
              href={fileUrl} 
              download={`${name}.pdf`}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors inline-flex items-center"
            >
              <Download className="w-4 h-4 mr-2" /> Download
            </a>
          ) : (
            <div></div>
          )}
          <Link
            to={`/build?resumeId=${resumeId}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" /> Edit in Builder
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResumeViewer;
