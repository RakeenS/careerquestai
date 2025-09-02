import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ModernResumePDF from './ModernResumePDF';

// We'll add other PDF templates as they are implemented
// import ClassicResumePDF from './ClassicResumePDF';
// import CompactResumePDF from './CompactResumePDF';
// etc.

interface ResumePDFGeneratorProps {
  resume: any; // Using any for now, but should match your Resume type
  fileName?: string;
  className?: string;
  children?: React.ReactNode;
}

const ResumePDFGenerator: React.FC<ResumePDFGeneratorProps> = ({
  resume,
  fileName = 'resume.pdf',
  className,
  children
}) => {
  const [key, setKey] = useState(Math.random());
  
  // Log for debugging
  useEffect(() => {
    console.log("ResumePDFGenerator rendering with resume:", resume);
  }, [resume]);

  // Ensure customization options are in the expected format
  const customizationOptions = {
    primaryColor: resume.customization?.primaryColor || '#0077B5',
    secondaryColor: resume.customization?.secondaryColor || '#000000',
    fontSize: resume.customization?.fontSize || 'medium',
    lineSpacing: resume.customization?.lineSpacing || 'normal'
  };

  // Create PDF document
  const MyDocument = () => (
    <ModernResumePDF 
      content={resume} 
      customizationOptions={customizationOptions} 
    />
  );

  return (
    <div key={key}>
      <PDFDownloadLink
        document={<MyDocument />}
        fileName={fileName}
        className={className}
        onClick={() => {
          console.log("PDF download link clicked");
          // Force refresh of the component after a delay to handle any state issues
          setTimeout(() => setKey(Math.random()), 1000);
        }}
      >
        {({ blob, url, loading, error }) => {
          // Log the state for debugging
          console.log("PDF generation state:", { loading, error, hasBlob: !!blob, hasUrl: !!url });
          
          if (loading) return 'Generating PDF...';
          
          // Only show error if there's an error AND no blob or URL
          // This handles cases where the library reports an error but still generates a PDF
          if (error && !blob && !url) {
            console.error("PDFDownloadLink error:", error);
            return 'Error generating PDF!';
          }
          
          // If we have a blob or URL, we consider it successful
          if (blob || url) {
            console.log("PDF ready:", { blob, url });
            return children || 'Download PDF';
          }
          
          // Fallback text
          return children || 'Download PDF';
        }}
      </PDFDownloadLink>
    </div>
  );
};

export default ResumePDFGenerator;
