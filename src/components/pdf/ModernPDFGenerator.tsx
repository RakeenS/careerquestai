import React, { useRef } from 'react';
import { Download, Loader } from 'lucide-react';
import { toPng } from 'html-to-image';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import { ResumeContent, CustomizationOptions } from '../../types';

// Register fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface ModernPDFGeneratorProps {
  contentRef: React.RefObject<HTMLDivElement>;
  fileName?: string;
  className?: string;
  children?: React.ReactNode;
  onGenerateStart?: () => void;
  onGenerateEnd?: () => void;
}

const ModernPDFGenerator: React.FC<ModernPDFGeneratorProps> = ({
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
      console.error('Cannot find content element');
      return;
    }

    try {
      setIsGenerating(true);
      if (onGenerateStart) onGenerateStart();
      
      console.log('Starting PDF generation with pdf-lib...');
      
      // First convert the HTML element to an image
      const dataUrl = await toPng(contentRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        skipAutoScale: true,
        style: {
          // Ensure the background color matches the template
          backgroundColor: 'white',
        },
      });
      
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Add a page with A4 size (in points, 72 points = 1 inch)
      // A4 size: 595 × 842 points
      const page = pdfDoc.addPage([595, 842]);
      
      // Load the image into the PDF
      const pngImage = await pdfDoc.embedPng(dataUrl);
      
      // Scale the image to fit on the page while maintaining aspect ratio
      const { width, height } = pngImage.scale(1);
      const aspectRatio = width / height;
      
      // Calculate dimensions to fit on the page with margins
      const maxWidth = page.getWidth() - 40; // 20pt margins on each side
      const maxHeight = page.getHeight() - 40; // 20pt margins on each side
      
      let scaledWidth = maxWidth;
      let scaledHeight = scaledWidth / aspectRatio;
      
      if (scaledHeight > maxHeight) {
        scaledHeight = maxHeight;
        scaledWidth = scaledHeight * aspectRatio;
      }
      
      // Center the image on the page
      const x = (page.getWidth() - scaledWidth) / 2;
      const y = (page.getHeight() - scaledHeight) / 2;
      
      // Draw the image on the page
      page.drawImage(pngImage, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      
      // Create a blob URL and trigger download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      
      console.log('PDF generated successfully');
      
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

// Also export a static class for direct usage
export class ModernPDFGeneratorClass {
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
  }) {
    if (!contentRef.current) {
      console.error('Cannot find content element');
      return;
    }

    try {
      if (onGenerateStart) onGenerateStart();
      
      console.log('Starting PDF generation with pdf-lib...');
      
      // First convert the HTML element to an image for the first page
      const dataUrl = await toPng(contentRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        skipAutoScale: true,
        style: {
          backgroundColor: 'white',
        },
      });
      
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Add a page with A4 size (in points, 72 points = 1 inch)
      // A4 size: 595 × 842 points
      const page = pdfDoc.addPage([595, 842]);
      
      // Load the image into the PDF
      const pngImage = await pdfDoc.embedPng(dataUrl);
      
      // Scale the image to fit on the page while maintaining aspect ratio
      const { width, height } = pngImage.scale(1);
      const aspectRatio = width / height;
      
      // Calculate dimensions to fit on the page with margins
      const maxWidth = page.getWidth() - 40; // 20pt margins on each side
      const maxHeight = page.getHeight() - 40; // 20pt margins on each side
      
      let scaledWidth = maxWidth;
      let scaledHeight = scaledWidth / aspectRatio;
      
      if (scaledHeight > maxHeight) {
        scaledHeight = maxHeight;
        scaledWidth = scaledHeight * aspectRatio;
      }
      
      // Center the image on the page
      const x = (page.getWidth() - scaledWidth) / 2;
      const y = (page.getHeight() - scaledHeight) / 2;
      
      // Draw the image on the page
      page.drawImage(pngImage, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      
      // Create a blob URL and trigger download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      
      console.log('PDF generated successfully');
      return true;
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      return false;
    } finally {
      if (onGenerateEnd) onGenerateEnd();
    }
  }
}

export default ModernPDFGenerator;
