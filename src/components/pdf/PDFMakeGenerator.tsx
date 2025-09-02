import React from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import { ResumeContent, CustomizationOptions, Education, Experience, Skill } from '../../types';

// We're acknowledging the TypeScript errors for these modules
// The modules work fine at runtime but don't have proper type definitions
// @ts-ignore
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Register fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface PDFMakeGeneratorProps {
  content: ResumeContent;
  customizationOptions: CustomizationOptions;
  selectedTemplate: string;
  fileName?: string;
  onGenerateStart?: () => void;
  onGenerateEnd?: () => void;
}

class PDFMakeGeneratorClass {
  static generatePDF(options: PDFMakeGeneratorProps): void {
    const {
      content,
      customizationOptions,
      selectedTemplate,
      fileName = 'resume.pdf',
      onGenerateStart,
      onGenerateEnd
    } = options;

    try {
      if (onGenerateStart) onGenerateStart();

      console.log('Generating PDF with pdfmake...');
      
      // Convert resume content to pdfmake format
      const docDefinition = this.createDocDefinition(content, customizationOptions, selectedTemplate);
      
      // Generate and download PDF
      pdfMake.createPdf(docDefinition).download(fileName);
      
      if (onGenerateEnd) onGenerateEnd();
    } catch (error) {
      console.error('Error generating PDF:', error);
      if (onGenerateEnd) onGenerateEnd();
    }
  }

  private static createDocDefinition(
    content: ResumeContent, 
    customizationOptions: CustomizationOptions, 
    selectedTemplate: string
  ) {
    // Set styles based on customization options
    const styles = {
      header: {
        fontSize: this.getFontSize(customizationOptions.fontSize) + 6,
        bold: true,
        margin: [0, 0, 0, 10],
        color: customizationOptions.primaryColor || '#2563eb'
      },
      subheader: {
        fontSize: this.getFontSize(customizationOptions.fontSize) + 2,
        bold: true,
        margin: [0, 10, 0, 5],
        color: customizationOptions.primaryColor || '#2563eb'
      },
      sectionTitle: {
        fontSize: this.getFontSize(customizationOptions.fontSize) + 1,
        bold: true,
        margin: [0, 10, 0, 5],
        color: customizationOptions.primaryColor || '#2563eb'
      },
      normalText: {
        fontSize: this.getFontSize(customizationOptions.fontSize),
        margin: [0, 0, 0, 5]
      },
      bold: {
        bold: true
      }
    };

    // Create document content
    const documentContent: any[] = [];
    
    // Header with name and title
    documentContent.push(
      { text: content.name || 'Your Name', style: 'header' },
      { text: content.jobTitle || 'Your Job Title', style: 'normalText', margin: [0, 0, 0, 10] }
    );
    
    // Contact information
    const contactInfo: any[] = [];
    if (content.email) {
      contactInfo.push({ text: `Email: ${content.email}`, style: 'normalText' });
    }
    if (content.phone) {
      contactInfo.push({ text: `Phone: ${content.phone}`, style: 'normalText' });
    }
    if (content.location) {
      contactInfo.push({ text: `Location: ${content.location}`, style: 'normalText' });
    }
    if (content.linkedin) {
      contactInfo.push({ text: `LinkedIn: ${content.linkedin}`, style: 'normalText' });
    }
    if (content.github) {
      contactInfo.push({ text: `GitHub: ${content.github}`, style: 'normalText' });
    }
    if (content.website) {
      contactInfo.push({ text: `Website: ${content.website}`, style: 'normalText' });
    }
    if (contactInfo.length > 0) {
      documentContent.push({ 
        stack: contactInfo,
        margin: [0, 0, 0, 10]
      });
    }
    
    // Professional Summary
    if (content.summary) {
      documentContent.push(
        { text: 'Professional Summary', style: 'subheader' },
        this.formatContent(content.summary),
        { text: '', margin: [0, 0, 0, 10] } // Spacing
      );
    }
    
    // Work Experience
    if (content.experience && content.experience.length > 0) {
      documentContent.push({ text: 'Work Experience', style: 'subheader' });
      
      content.experience.forEach((job: Experience) => {
        const jobInfo: any[] = [];
        
        // Job title and employer
        if (job.jobTitle || job.employer) {
          jobInfo.push({ 
            text: `${job.jobTitle || ''}${job.employer ? ' at ' + job.employer : ''}`, 
            style: 'sectionTitle' 
          });
        }
        
        // Date range and location
        const dateLocation: string[] = [];
        if (job.startDate || job.endDate) {
          dateLocation.push(`${job.startDate || ''} - ${job.endDate || (job.current ? 'Present' : '')}`);
        }
        if (job.location) {
          dateLocation.push(job.location);
        }
        
        if (dateLocation.length > 0) {
          jobInfo.push({ 
            text: dateLocation.join(' | '),
            style: 'normalText',
            italics: true
          });
        }
        
        // Job description - Special handling for bullet points
        if (job.description) {
          const formattedDescription = this.formatContent(job.description, true);
          jobInfo.push(formattedDescription);
        }
        
        // Achievements if available
        if (job.achievements && job.achievements.length > 0) {
          const achievementsList = {
            ul: job.achievements,
            style: 'normalText'
          };
          jobInfo.push(achievementsList);
        }
        
        jobInfo.push({ text: '', margin: [0, 0, 0, 10] }); // Add spacing
        documentContent.push({ stack: jobInfo });
      });
    }
    
    // Skills
    if (content.skills && content.skills.length > 0) {
      documentContent.push({ text: 'Skills', style: 'subheader' });
      
      // Group skills by category if they have categories
      const skillsByCategory: Record<string, string[]> = {};
      
      content.skills.forEach((skill: Skill) => {
        const category = skill.category || 'Other';
        if (!skillsByCategory[category]) {
          skillsByCategory[category] = [];
        }
        skillsByCategory[category].push(skill.name);
      });
      
      // Create content for skills
      const skillsContent: any[] = [];
      Object.entries(skillsByCategory).forEach(([category, skills]) => {
        if (Object.keys(skillsByCategory).length > 1) {
          // Only show categories if there are multiple
          skillsContent.push({ text: category, style: 'sectionTitle', margin: [0, 5, 0, 3] });
        }
        skillsContent.push({
          ul: skills,
          style: 'normalText',
          margin: [0, 0, 0, 5]
        });
      });
      
      documentContent.push({ stack: skillsContent }, { text: '', margin: [0, 0, 0, 10] });
    }
    
    // Education
    if (content.education && content.education.length > 0) {
      documentContent.push({ text: 'Education', style: 'subheader' });
      
      content.education.forEach((edu: Education) => {
        const eduInfo: any[] = [];
        
        // Degree and school
        if (edu.degree || edu.school) {
          eduInfo.push({ 
            text: `${edu.degree || ''}${edu.fieldOfStudy ? ' in ' + edu.fieldOfStudy : ''}${edu.school ? ' at ' + edu.school : ''}`, 
            style: 'sectionTitle' 
          });
        }
        
        // Date range and location
        const dateLocation: string[] = [];
        if (edu.startDate || edu.endDate) {
          dateLocation.push(`${edu.startDate || ''} - ${edu.endDate || 'Present'}`);
        }
        if (edu.location) {
          dateLocation.push(edu.location);
        }
        if (edu.gpa) {
          dateLocation.push(`GPA: ${edu.gpa}`);
        }
        
        if (dateLocation.length > 0) {
          eduInfo.push({ 
            text: dateLocation.join(' | '),
            style: 'normalText',
            italics: true
          });
        }
        
        // Description
        if (edu.description) {
          const formattedDescription = this.formatContent(edu.description);
          eduInfo.push(formattedDescription);
        }
        
        // Achievements
        if (edu.achievements && edu.achievements.length > 0) {
          const achievementsList = {
            ul: edu.achievements,
            style: 'normalText'
          };
          eduInfo.push(achievementsList);
        }
        
        eduInfo.push({ text: '', margin: [0, 0, 0, 10] }); // Add spacing
        documentContent.push({ stack: eduInfo });
      });
    }
    
    return {
      content: documentContent,
      styles: styles,
      defaultStyle: {
        fontSize: this.getFontSize(customizationOptions.fontSize),
        lineHeight: this.getLineHeight(customizationOptions.lineSpacing)
      },
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40]
    };
  }
  
  // Helper function to get font size based on customization option
  private static getFontSize(size: string): number {
    switch (size) {
      case 'small': return 9;
      case 'medium': return 10;
      case 'large': return 12;
      default: return 10;
    }
  }
  
  // Helper function to get line height based on customization option
  private static getLineHeight(spacing: string): number {
    switch (spacing) {
      case 'compact': return 1.2;
      case 'normal': return 1.5;
      case 'spacious': return 1.8;
      default: return 1.5;
    }
  }
  
  // Helper function to format HTML content for pdfmake
  private static formatContent(content: string, checkForBullets: boolean = false): any {
    try {
      if (!content) return { text: '' };
      
      // Check if content already has bullet points (HTML format)
      if (content.includes('<ul>') || content.includes('<li>')) {
        // Convert HTML to pdfmake format
        const pdfContent = htmlToPdfmake(content);
        return pdfContent;
      } 
      
      // Check for plain text bullet points (• or - format)
      if (checkForBullets && (content.includes('•') || content.includes('-'))) {
        // Split by bullet points
        const lines = content.split(/[•\-]\s+/);
        
        // Create bullet list for pdfmake
        const bulletItems = lines
          .filter(line => line.trim().length > 0)
          .map(line => line.trim());
        
        // Return as bullet list
        return {
          ul: bulletItems,
          style: 'normalText'
        };
      }
      
      // If no bullet points detected, return as regular text
      return { text: content, style: 'normalText' };
    } catch (error) {
      console.error('Error formatting content:', error);
      return { text: content || '', style: 'normalText' };
    }
  }
}

// React component wrapper
const PDFMakeGenerator: React.FC<PDFMakeGeneratorProps> = (props) => {
  const handleGeneratePDF = () => {
    PDFMakeGeneratorClass.generatePDF(props);
  };

  return (
    <button 
      onClick={handleGeneratePDF} 
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
    >
      Download PDF
    </button>
  );
};

export { PDFMakeGeneratorClass };
export default PDFMakeGenerator;
