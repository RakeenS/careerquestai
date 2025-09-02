import React, { useRef } from 'react';
import { Download } from 'lucide-react';
import PrintableResume from './PrintableResume';
import ReactPDFGenerator from './ReactPDFGenerator';
import { ResumeContent, CustomizationOptions } from '../../types';

interface ResumePrinterProps {
  content: ResumeContent;
  customizationOptions: CustomizationOptions;
  selectedTemplate: string;
  fileName?: string;
  className?: string;
  children?: React.ReactNode;
  isPrinting: boolean;
  setIsPrinting: (isPrinting: boolean) => void;
}

const ResumePrinter: React.FC<ResumePrinterProps> = ({
  content,
  customizationOptions,
  selectedTemplate,
  fileName = 'resume.pdf',
  className,
  children,
  isPrinting,
  setIsPrinting
}) => {
  // Create a reference to the printable component
  const componentRef = useRef<HTMLDivElement>(null);

  // We'll use the ReactPDFGenerator component directly instead of a handler function
  // But we still need to handle isPrinting state for the UI
  React.useEffect(() => {
    const handleBeforePrint = () => {
      console.log('Preparing for PDF generation...');
      setIsPrinting(true);
    };
    
    const handleAfterPrint = () => {
      console.log('PDF generation completed');
      setIsPrinting(false);
    };
    
    // Listen for the custom events that will be dispatched by ReactPDFGenerator
    window.addEventListener('resume-pdf-generation-start', handleBeforePrint);
    window.addEventListener('resume-pdf-generation-end', handleAfterPrint);
    
    return () => {
      window.removeEventListener('resume-pdf-generation-start', handleBeforePrint);
      window.removeEventListener('resume-pdf-generation-end', handleAfterPrint);
    };
  }, [setIsPrinting]);

  return (
    <>
      {/* Hidden printable component */}
      <div style={{ 
        position: 'fixed', 
        top: '-9999px', 
        left: '-9999px',
        zIndex: -1000,
        opacity: 0,
        pointerEvents: 'none'
      }}>
        <div style={{
          width: '210mm',
          minHeight: '297mm',
          background: 'white',
          boxShadow: 'none',
          overflow: 'hidden'
        }}>
          <PrintableResume
            ref={componentRef}
            content={content}
            customizationOptions={customizationOptions}
            selectedTemplate={selectedTemplate as any}
          />
        </div>
      </div>

      {/* React PDF Generator Component */}
      <ReactPDFGenerator
        content={content}
        customizationOptions={customizationOptions}
        selectedTemplate={selectedTemplate}
        fileName={fileName}
        className={className || "flex items-center px-6 py-3 text-white rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 font-medium"}
        isPrinting={isPrinting}
      >
        {children || (
          <>
            <Download className="w-5 h-5 mr-2" />
            {isPrinting ? 'Generating PDF...' : 'Download Resume PDF'}
          </>
        )}
      </ReactPDFGenerator>
    </>
  );
};

export default ResumePrinter;
