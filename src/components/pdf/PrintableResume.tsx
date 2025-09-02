import { forwardRef } from 'react';
import { ResumeContent, CustomizationOptions } from '../../types';

// Import templates
import ModernResumeTemplate from '../ModernResumeTemplate';
import ClassicResumeTemplate from '../ClassicResumeTemplate';
import CompactResumeTemplate from '../CompactResumeTemplate';
import ElegantResumeTemplate from '../ElegantResumeTemplate';
import CreativeResumeTemplate from '../CreativeResumeTemplate';
import MinimalistResumeTemplate from '../MinimalistResumeTemplate';
import ProfessionalResumeTemplate from '../ProfessionalResumeTemplate';

type TemplateType = 'modern' | 'classic' | 'compact' | 'elegant' | 'creative' | 'minimalist' | 'professional';

interface PrintableResumeProps {
  content: ResumeContent;
  customizationOptions: CustomizationOptions;
  selectedTemplate: TemplateType;
}

// Using forwardRef to expose this component to react-to-print
const PrintableResume = forwardRef<HTMLDivElement, PrintableResumeProps>(
  ({ content, customizationOptions, selectedTemplate }, ref) => {
    const renderTemplate = () => {
      const templateProps = {
        content,
        customizationOptions,
      };

      switch (selectedTemplate) {
        case 'modern':
          return <ModernResumeTemplate {...templateProps} />;
        case 'classic':
          return <ClassicResumeTemplate {...templateProps} />;
        case 'compact':
          return <CompactResumeTemplate {...templateProps} />;
        case 'elegant':
          return <ElegantResumeTemplate {...templateProps} />;
        case 'creative':
          return <CreativeResumeTemplate {...templateProps} />;
        case 'minimalist':
          return <MinimalistResumeTemplate {...templateProps} />;
        case 'professional':
          return <ProfessionalResumeTemplate {...templateProps} />;
        default:
          return <ModernResumeTemplate {...templateProps} />;
      }
    };

    // Functions to convert customization options to CSS values
    const getFontSize = (size: string): string => {
      switch (size) {
        case 'small': return '0.9rem';
        case 'medium': return '1rem';
        case 'large': return '1.1rem';
        default: return '1rem';
      }
    };

    const getLineHeight = (spacing: string): string => {
      switch (spacing) {
        case 'compact': return '1.3';
        case 'normal': return '1.5';
        case 'spacious': return '1.8';
        default: return '1.5';
      }
    };

    return (
      <div 
        ref={ref}
        className="printable-resume bg-white"
        style={{
          width: '210mm', // A4 width
          minHeight: '297mm', // A4 height
          margin: '0 auto',
          padding: '10mm',
          boxSizing: 'border-box',
          backgroundColor: 'white',
          color: 'black',
          fontFamily: customizationOptions.fontFamily,
          fontSize: getFontSize(customizationOptions.fontSize),
          lineHeight: getLineHeight(customizationOptions.lineSpacing),
          overflow: 'hidden',
          position: 'relative',
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        {/* Inline styles to enforce bullet point rendering in PDF */}
        <style>
          {`
            /* Essential styling for PDF generation - ensure this appears in the PDF */
            .printable-resume ul, .bullet-points ul, ul {
              list-style-position: outside !important;
              list-style-type: disc !important;
              padding-left: 1.5em !important;
              margin-left: 0.5em !important;
              margin-bottom: 0.5em !important;
              page-break-inside: avoid !important;
              text-indent: 0 !important;
            }
            
            .printable-resume li, .bullet-points li, li {
              display: list-item !important;
              list-style-type: disc !important;
              margin-bottom: 0.5em !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              white-space: normal !important;
              text-indent: 0 !important;
            }
            
            .printable-resume ul li, .bullet-points ul li, ul li {
              list-style-type: disc !important;
              display: list-item !important;
            }
            
            /* Force paragraph spacing and line breaks */
            p {
              margin-bottom: 0.4em !important;
              page-break-inside: avoid !important;
              white-space: normal !important;
            }
            
            /* Ensure section content maintains proper spacing */
            .resume-section-content {
              white-space: normal !important;
              line-height: 1.5 !important;
            }
            
            /* Fix for nested content */
            div[dangerouslySetInnerHTML] {
              white-space: normal !important;
            }
          `}
        </style>
        {renderTemplate()}
      </div>
    );
  }
);

PrintableResume.displayName = 'PrintableResume';

export default PrintableResume;
