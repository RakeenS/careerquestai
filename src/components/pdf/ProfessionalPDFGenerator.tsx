import React from 'react';
import { Download, Loader } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface ProfessionalPDFGeneratorProps {
  contentRef: React.RefObject<HTMLDivElement>;
  fileName?: string;
  className?: string;
  children?: React.ReactNode;
  onGenerateStart?: () => void;
  onGenerateEnd?: () => void;
}

/**
 * A professional PDF generator component that creates high-quality PDFs
 * from resume templates using jsPDF with html2canvas
 */
const ProfessionalPDFGenerator: React.FC<ProfessionalPDFGeneratorProps> = ({
  contentRef,
  fileName = 'resume.pdf',
  className,
  children,
  onGenerateStart,
  onGenerateEnd
}) => {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const generatePDF = async () => {
    if (!contentRef.current) {
      console.error('Cannot find content element to convert to PDF');
      return;
    }

    try {
      setIsGenerating(true);
      if (onGenerateStart) onGenerateStart();
      
      console.log('Starting professional PDF generation...');
      
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // A4 dimensions in mm (210 × 297 mm)
      const imgWidth = 210;
      const pageHeight = 297;
      
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Create PDF instance with mm units
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if the resume is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Save the PDF with given filename
      pdf.save(fileName);
      
      console.log('PDF generated and saved successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
      if (onGenerateEnd) onGenerateEnd();
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className={className || "flex items-center px-6 py-3 text-white rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 font-medium"}
    >
      {isGenerating ? (
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
export class ProfessionalPDFGeneratorClass {
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
      
      console.log('Starting professional PDF generation via class method...');
      
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // A4 dimensions in mm (210 × 297 mm)
      const imgWidth = 210;
      const pageHeight = 297;
      
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Create PDF instance with mm units
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if the resume is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
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

export default ProfessionalPDFGenerator;
