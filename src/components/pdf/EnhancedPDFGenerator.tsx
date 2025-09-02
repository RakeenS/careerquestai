import React from 'react';
import { Download, Loader } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface EnhancedPDFGeneratorProps {
  contentRef: React.RefObject<HTMLDivElement>;
  fileName?: string;
  className?: string;
  children?: React.ReactNode;
  isPrinting?: boolean;
  setIsPrinting?: (value: boolean) => void;
}

/**
 * Enhanced PDF generator component that creates high-quality PDFs
 * This uses jsPDF with html2canvas to capture resume styling precisely
 */
const EnhancedPDFGenerator: React.FC<EnhancedPDFGeneratorProps> = ({
  contentRef,
  fileName = 'resume.pdf',
  className,
  children,
  isPrinting = false,
  setIsPrinting = () => {}
}) => {
  const generatePDF = async () => {
    if (!contentRef.current) {
      console.error('Cannot find content element to convert to PDF');
      return;
    }

    try {
      setIsPrinting(true);
      console.log('Starting enhanced PDF generation...');
      
      const element = contentRef.current;
      
      // Temporarily adjust the resume container to ensure it fits an A4 page correctly
      // We'll restore this later
      const originalStylePosition = element.style.position;
      const originalStyleDisplay = element.style.display;
      const originalStyleWidth = element.style.width;
      const originalStyleHeight = element.style.height;
      
      element.style.width = '210mm'; // A4 width
      element.style.height = 'auto';
      element.style.position = 'absolute';
      element.style.top = '-9999px';
      element.style.left = '-9999px';
      document.body.appendChild(element.cloneNode(true));
      
      // Generate canvas at higher resolution
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Restore the original positioning and size
      element.style.position = originalStylePosition;
      element.style.display = originalStyleDisplay;
      element.style.width = originalStyleWidth;
      element.style.height = originalStyleHeight;
      
      // Calculate aspect ratio
      const aspectRatio = canvas.height / canvas.width;
      
      // A4 dimensions in mm (210 × 297 mm)
      const pageWidth = 210;
      
      // Calculate the height based on aspect ratio
      const pageHeight = pageWidth * aspectRatio;
      
      // Create PDF instance with mm units
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageData = canvas.toDataURL('image/jpeg', 1.0);
      
      // If the resume fits on one page
      if (pageHeight <= 297) {
        pdf.addImage(pageData, 'JPEG', 0, 0, pageWidth, pageHeight);
      } else {
        // If the resume is longer than one page, we need to split it into multiple pages
        let heightLeft = pageHeight;
        let position = 0;
        let page = 1;
        
        // Add the first page
        pdf.addImage(pageData, 'JPEG', 0, position, pageWidth, pageHeight);
        heightLeft -= 297;
        
        // Add additional pages if needed
        while (heightLeft > 0) {
          position = -297 * page;
          pdf.addPage();
          pdf.addImage(pageData, 'JPEG', 0, position, pageWidth, pageHeight);
          heightLeft -= 297;
          page++;
        }
      }
      
      // Save the PDF with given filename
      pdf.save(fileName);
      
      console.log('PDF generated and saved successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating your PDF. Please try again.');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isPrinting}
      className={className || "flex items-center px-6 py-3 text-white rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 font-medium"}
    >
      {isPrinting ? (
        <>
          <Loader className="w-5 h-5 mr-2 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="w-5 h-5 mr-2" />
          {children || 'Download Resume PDF'}
        </>
      )}
    </button>
  );
};

// Static class for direct usage
export class EnhancedPDFGeneratorClass {
  static async generatePDF({ 
    contentRef, 
    fileName = 'resume.pdf',
    onGenerateStart,
    onGenerateEnd
  }: {
    contentRef: React.RefObject<HTMLDivElement>;
    fileName?: string;
    onGenerateStart?: () => void;
    onGenerateEnd?: () => void;
  }): Promise<boolean> {
    if (!contentRef.current) {
      console.error('Cannot find content element to convert to PDF');
      return false;
    }

    try {
      if (onGenerateStart) onGenerateStart();
      
      console.log('Starting enhanced PDF generation via class method...');
      
      const element = contentRef.current;
      
      // Temporarily adjust the resume container for optimal PDF generation
      const originalStylePosition = element.style.position;
      const originalStyleDisplay = element.style.display;
      const originalStyleWidth = element.style.width;
      const originalStyleHeight = element.style.height;
      
      element.style.width = '210mm'; // A4 width
      element.style.height = 'auto';
      element.style.position = 'absolute';
      element.style.top = '-9999px';
      element.style.left = '-9999px';
      document.body.appendChild(element.cloneNode(true));
      
      // Generate canvas at higher resolution
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Restore the original positioning and size
      element.style.position = originalStylePosition;
      element.style.display = originalStyleDisplay;
      element.style.width = originalStyleWidth;
      element.style.height = originalStyleHeight;
      
      // Calculate aspect ratio
      const aspectRatio = canvas.height / canvas.width;
      
      // A4 dimensions in mm (210 × 297 mm)
      const pageWidth = 210;
      
      // Calculate the height based on aspect ratio
      const pageHeight = pageWidth * aspectRatio;
      
      // Create PDF instance with mm units
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageData = canvas.toDataURL('image/jpeg', 1.0);
      
      // If the resume fits on one page
      if (pageHeight <= 297) {
        pdf.addImage(pageData, 'JPEG', 0, 0, pageWidth, pageHeight);
      } else {
        // If the resume is longer than one page, we need to split it into multiple pages
        let heightLeft = pageHeight;
        let position = 0;
        let page = 1;
        
        // Add the first page
        pdf.addImage(pageData, 'JPEG', 0, position, pageWidth, pageHeight);
        heightLeft -= 297;
        
        // Add additional pages if needed
        while (heightLeft > 0) {
          position = -297 * page;
          pdf.addPage();
          pdf.addImage(pageData, 'JPEG', 0, position, pageWidth, pageHeight);
          heightLeft -= 297;
          page++;
        }
      }
      
      // Save the PDF with given filename
      pdf.save(fileName);
      
      console.log('PDF generated and saved successfully');
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return false;
    } finally {
      if (onGenerateEnd) onGenerateEnd();
    }
  }
}

export default EnhancedPDFGenerator;
