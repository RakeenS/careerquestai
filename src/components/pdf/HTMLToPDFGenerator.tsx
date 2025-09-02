import React from 'react';
import html2pdf from 'html2pdf.js';

interface HTMLToPDFGeneratorProps {
  contentRef: React.RefObject<HTMLElement>;
  fileName?: string;
  className?: string;
  children?: React.ReactNode;
  onGenerateStart?: () => void;
  onGenerateEnd?: () => void;
  paperSize?: string;
}

interface GeneratePDFOptions {
  contentRef: React.RefObject<HTMLElement>;
  fileName?: string;
  onGenerateStart?: () => void;
  onGenerateEnd?: () => void;
  paperSize?: string;
}

class HTMLToPDFGeneratorClass {
  static async generatePDF(options: GeneratePDFOptions): Promise<void> {
    const {
      contentRef,
      fileName = 'document.pdf',
      onGenerateStart,
      onGenerateEnd,
      paperSize = 'a4'
    } = options;

    if (!contentRef.current) {
      console.error("Content reference is not available");
      throw new Error('Content reference is not available');
    }

    try {
      if (onGenerateStart) onGenerateStart();
      
      // Get the original element
      const element = contentRef.current;
      console.log("Original element for PDF:", element);
      
      // Create a deep clone with styles preserved
      const clone = element.cloneNode(true) as HTMLElement;
      
      // CRITICAL STEP FOR PDF BULLETS: We need to completely transform list elements into a bulletproof format
      console.log("Applying bulletproof formatting for PDF rendering");
      
      // Force specific styles that might be causing issues
      clone.style.width = '210mm'; // A4 width
      clone.style.minHeight = '297mm'; // A4 height
      clone.style.position = 'relative';
      clone.style.backgroundColor = 'white';
      clone.style.color = 'black';
      clone.style.padding = '20px';
      clone.style.overflow = 'hidden';
      
      // Add explicit styles for bullet points that will be preserved in PDF
      const styleEl = document.createElement('style');
      styleEl.textContent = `
        ul, ol {
          list-style-position: outside !important;
          padding-left: 1.5em !important;
          margin-left: 0.5em !important;
        }
        li {
          display: list-item !important;
          margin-bottom: 0.25em !important;
        }
        ul li {
          list-style-type: disc !important;
        }
        .bullet-points ul li {
          list-style-type: disc !important;
          display: list-item !important;
        }
        .bullet-points li {
          display: list-item !important;
        }
      `;
      clone.appendChild(styleEl);
      
      // Force all child elements to have default styling that works well for PDF
      const allElements = clone.getElementsByTagName('*');
      for (let i = 0; i < allElements.length; i++) {
        const el = allElements[i] as HTMLElement;
        if (el.style) {
          // Ensure text is visible
          if (el.textContent && el.textContent.trim().length > 0) {
            el.style.color = el.style.color || 'black';
          }
          
          // Ensure bullet points are displayed properly
          if (el.tagName.toLowerCase() === 'ul') {
            el.style.listStylePosition = 'outside';
            el.style.paddingLeft = '1.5em';
            el.style.marginLeft = '0.5em';
          }
          if (el.tagName.toLowerCase() === 'li') {
            el.style.display = 'list-item';
            el.style.marginBottom = '0.25em';
          }
          if (el.tagName.toLowerCase() === 'ul' && el.parentElement?.classList.contains('bullet-points')) {
            const listItems = el.getElementsByTagName('li');
            for (let j = 0; j < listItems.length; j++) {
              (listItems[j] as HTMLElement).style.listStyleType = 'disc';
              (listItems[j] as HTMLElement).style.display = 'list-item';
            }
          }
        }
      }
      
      // Temporarily append to body but make it invisible
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      document.body.appendChild(clone);
      
      console.log("PDF clone created and appended to body");
      
      // Process the clone to ensure content is properly preserved for PDF
      const allContentSections = clone.querySelectorAll('.resume-section-content');
      allContentSections.forEach(section => {
        // Check if content section contains bullet points or lists
        const ulElements = section.querySelectorAll('ul');
        ulElements.forEach(ul => {
          // Add explicit styling to ensure bullet points appear
          ul.setAttribute('style', 'list-style-type: disc !important; padding-left: 20px !important; margin-left: 0 !important;');
          
          // Ensure each list item has bullet points and proper spacing
          const liElements = ul.querySelectorAll('li');
          liElements.forEach(li => {
            li.setAttribute('style', 'display: list-item !important; margin-bottom: 5px !important; page-break-inside: avoid !important;');
          });
        });
        
        // Ensure line breaks are preserved by replacing <br> with proper paragraph spacing
        const html = section.innerHTML;
        if (html && html.includes('<br>')) {
          section.innerHTML = html.replace(/<br\s*\/?>/gi, '</p><p style="margin-bottom: 8px;">');  
        }
      });
      
      // Configure html2pdf options with improved settings for proper formatting
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: true, // Enable logging
          allowTaint: true, // Allow loading cross-origin images
          backgroundColor: '#ffffff', // Force white background
          // Improve line break handling
          onclone: (document: Document) => {
            const bodyStyles = document.createElement('style');
            bodyStyles.innerHTML = `
              p { margin-bottom: 8px !important; }
              ul { list-style-type: disc !important; padding-left: 20px !important; }
              li { display: list-item !important; margin-bottom: 5px !important; }
              .resume-section-content { white-space: normal !important; }
            `;
            document.head.appendChild(bodyStyles);
            return document;
          }
        },
        jsPDF: { 
          unit: 'mm', 
          format: paperSize, 
          orientation: 'portrait',
          compress: true
        }
      };
      
      console.log("Starting PDF generation with options:", opt);
      
      // FINAL ATTEMPT: Manual direct replacement of UL/LI elements with explicit bullet points
      // This will directly modify each list before the PDF is generated
      const workExperienceElements = clone.querySelectorAll('.resume-section-content ul');
      console.log(`Found ${workExperienceElements.length} UL elements to process for bullet-proof formatting`);
      
      workExperienceElements.forEach((ul) => {
        // Create a replacement container for our bulletproof list
        const bulletContainer = document.createElement('div');
        bulletContainer.style.marginLeft = '0';
        bulletContainer.style.paddingLeft = '0';
        
        // Process all list items
        const listItems = ul.querySelectorAll('li');
        listItems.forEach((item) => {
          // For each list item, create a paragraph with explicit bullet character
          const bulletPoint = document.createElement('div');
          bulletPoint.style.display = 'flex';
          bulletPoint.style.marginBottom = '8px';
          bulletPoint.style.textAlign = 'left';
          bulletPoint.style.whiteSpace = 'normal';
          
          // Create explicit bullet character
          const bullet = document.createElement('span');
          bullet.innerHTML = '&bull;&nbsp;';
          bullet.style.display = 'inline-block';
          bullet.style.width = '20px';
          bullet.style.flexShrink = '0';
          
          // Create content container
          const content = document.createElement('span');
          content.innerHTML = item.innerHTML;
          content.style.display = 'inline-block';
          content.style.whiteSpace = 'normal';
          
          // Assemble the bullet point
          bulletPoint.appendChild(bullet);
          bulletPoint.appendChild(content);
          bulletContainer.appendChild(bulletPoint);
        });
        
        // Replace the original UL with our custom container
        if (ul.parentNode) {
          ul.parentNode.replaceChild(bulletContainer, ul);
        }
      });
      
      // Also check for plain text with bullet markers and convert them
      const textElements = clone.querySelectorAll('div, p, span');
      textElements.forEach((el) => {
        const text = el.innerHTML;
        // Only process if this contains bullet points but isn't already processed
        if ((text.includes('•') || text.includes('-')) && 
            !el.parentElement?.className?.includes('bullet') && 
            el.children.length === 0) {
          
          // Split by bullet points
          const lines = text.split(/[•\-]\s+/);
          if (lines.length > 1) {
            // Create a container for formatted bullet points
            const bulletContainer = document.createElement('div');
            
            // Handle text before first bullet point
            if (lines[0].trim().length > 0) {
              const intro = document.createElement('div');
              intro.textContent = lines[0].trim();
              intro.style.marginBottom = '8px';
              bulletContainer.appendChild(intro);
            }
            
            // Create properly formatted bullet points
            for (let i = 1; i < lines.length; i++) {
              if (lines[i].trim().length > 0) {
                // Create flex container for bullet point
                const bulletPoint = document.createElement('div');
                bulletPoint.style.display = 'flex';
                bulletPoint.style.marginBottom = '8px';
                bulletPoint.style.whiteSpace = 'normal';
                
                // Add bullet character
                const bullet = document.createElement('span');
                bullet.innerHTML = '&bull;&nbsp;';
                bullet.style.display = 'inline-block';
                bullet.style.width = '20px';
                bullet.style.flexShrink = '0';
                
                // Add content
                const content = document.createElement('span');
                content.textContent = lines[i].trim();
                content.style.display = 'inline-block';
                content.style.whiteSpace = 'normal';
                
                // Assemble
                bulletPoint.appendChild(bullet);
                bulletPoint.appendChild(content);
                bulletContainer.appendChild(bulletPoint);
              }
            }
            
            // Replace original element with our bulletproof container
            el.innerHTML = '';
            el.appendChild(bulletContainer);
          }
        }
      });
      
      // Generate PDF
      await html2pdf().from(clone).set(opt).save();
      console.log("PDF saved successfully");
      
      // Clean up
      document.body.removeChild(clone);
      
    } catch (err) {
      console.error("Error generating PDF:", err);
      throw err;
    } finally {
      if (onGenerateEnd) onGenerateEnd();
    }
  }
}

const HTMLToPDFGenerator: React.FC<HTMLToPDFGeneratorProps> = ({
  contentRef,
  fileName = 'document.pdf',
  className,
  children,
  onGenerateStart,
  onGenerateEnd,
  paperSize = 'a4'
}) => {
  const [generating, setGenerating] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const generatePDF = async () => {
    try {
      setGenerating(true);
      setError(null);
      
      await HTMLToPDFGeneratorClass.generatePDF({
        contentRef,
        fileName,
        paperSize,
        onGenerateStart,
        onGenerateEnd
      });
      
    } catch (err: any) {
      console.error("Error in PDF button:", err);
      setError(err?.message || 'Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      className={className}
      onClick={generatePDF}
      disabled={generating}
    >
      {generating ? 'Generating PDF...' : error ? error : children}
    </button>
  );
};

export { HTMLToPDFGeneratorClass };
export default HTMLToPDFGenerator;
