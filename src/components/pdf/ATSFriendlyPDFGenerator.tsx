import React, { useState } from 'react';
import { Download, Loader } from 'lucide-react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  pdf,
  Font
} from '@react-pdf/renderer';
import { ResumeContent, CustomizationOptions, Experience, Education, Skill } from '../../types';

// Use only basic fonts to avoid loading issues
Font.register({
  family: 'Helvetica',
  fonts: []
});

// Helper function to strip HTML tags from content
const stripHtmlTags = (html: string | undefined): string => {
  if (!html) return '';
  
  // Simple HTML tag stripping
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')  // Replace &nbsp; with spaces
    .replace(/&amp;/g, '&')   // Replace &amp; with &
    .replace(/&lt;/g, '<')    // Replace &lt; with <
    .replace(/&gt;/g, '>')    // Replace &gt; with >
    .trim();                  // Trim any extra whitespace
};

// Create styles for the PDF document
const createStyles = (customizationOptions: CustomizationOptions) => {
  const { primaryColor, fontSize } = customizationOptions;
  
  // Convert fontSize string to number for calculations
  const baseFontSize = fontSize === 'small' ? 9 : fontSize === 'medium' ? 10 : 11;
  
  return StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      padding: 30,
      fontFamily: 'Helvetica', // Use built-in PDF font
    },
    section: {
      marginBottom: 10,
    },
    header: {
      marginBottom: 20,
    },
    name: {
      fontSize: baseFontSize + 8,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    contactInfo: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 10,
      fontSize: baseFontSize,
    },
    contactItem: {
      marginRight: 15,
      marginBottom: 3,
    },
    sectionTitle: {
      fontSize: baseFontSize + 2,
      fontWeight: 'bold',
      color: primaryColor || '#2563eb',
      paddingBottom: 2,
      marginBottom: 6,
      borderBottomWidth: 1,
      borderBottomColor: primaryColor || '#2563eb',
    },
    summary: {
      fontSize: baseFontSize,
      marginBottom: 10,
      lineHeight: 1.4,
    },
    experienceItem: {
      marginBottom: 10,
    },
    jobTitle: {
      fontSize: baseFontSize + 1,
      fontWeight: 'bold',
    },
    companyName: {
      fontSize: baseFontSize,
      fontWeight: 'bold',
    },
    jobPeriod: {
      fontSize: baseFontSize - 1,
      fontStyle: 'italic',
      marginBottom: 3,
    },
    jobDescription: {
      fontSize: baseFontSize,
      marginTop: 2,
      lineHeight: 1.4,
    },
    bulletRow: {
      flexDirection: 'row',
      marginBottom: 2,
    },
    bulletPoint: {
      width: 10,
      fontSize: baseFontSize,
    },
    bulletContent: {
      flex: 1,
      fontSize: baseFontSize,
      lineHeight: 1.4,
    },
    educationItem: {
      marginBottom: 10,
    },
    degree: {
      fontSize: baseFontSize + 1,
      fontWeight: 'bold',
    },
    school: {
      fontSize: baseFontSize,
      fontWeight: 'bold',
    },
    educationPeriod: {
      fontSize: baseFontSize - 1,
      fontStyle: 'italic',
      marginBottom: 3,
    },
    skillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    skillItem: {
      backgroundColor: '#f3f4f6',
      borderRadius: 4,
      padding: '4 8',
      marginRight: 8,
      marginBottom: 8,
      fontSize: baseFontSize - 1,
    },
  });
};

// PDF Document component
const ResumeDocument = ({ content, customizationOptions }: {
  content: ResumeContent;
  customizationOptions: CustomizationOptions;
}) => {
  const styles = createStyles(customizationOptions);
  
  return (
    <Document title={`${content.name} - Resume`} author={content.name}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{stripHtmlTags(content.name)}</Text>
          
          <View style={styles.contactInfo}>
            {content.email && (
              <Text style={styles.contactItem}>{stripHtmlTags(content.email)}</Text>
            )}
            {content.phone && (
              <Text style={styles.contactItem}>{stripHtmlTags(content.phone)}</Text>
            )}
            {content.location && (
              <Text style={styles.contactItem}>{stripHtmlTags(content.location)}</Text>
            )}
            {content.linkedin && (
              <Text style={styles.contactItem}>{stripHtmlTags(content.linkedin)}</Text>
            )}
          </View>
        </View>

        {content.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{stripHtmlTags(content.summary)}</Text>
          </View>
        )}

        {content.experience && content.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            
            {content.experience.map((exp: Experience, index: number) => (
              <View key={index} style={styles.experienceItem}>
                <Text style={styles.jobTitle}>{stripHtmlTags(exp.jobTitle)}</Text>
                <Text style={styles.companyName}>{stripHtmlTags(exp.employer)}</Text>
                <Text style={styles.jobPeriod}>
                  {stripHtmlTags(exp.startDate) || ''} - {stripHtmlTags(exp.endDate) || 'Present'}
                </Text>
                
                {exp.description && (
                  <Text style={styles.jobDescription}>{stripHtmlTags(exp.description)}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {content.education && content.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            
            {content.education.map((edu: Education, index: number) => (
              <View key={index} style={styles.educationItem}>
                <Text style={styles.degree}>
                  {stripHtmlTags(edu.degree)} {edu.fieldOfStudy && `in ${stripHtmlTags(edu.fieldOfStudy)}`}
                </Text>
                <Text style={styles.school}>{stripHtmlTags(edu.school)}</Text>
                <Text style={styles.educationPeriod}>
                  {stripHtmlTags(edu.startDate) || ''} - {stripHtmlTags(edu.endDate) || 'Present'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {content.skills && content.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {content.skills.map((skill: Skill, index: number) => (
                <Text key={index} style={styles.skillItem}>
                  {stripHtmlTags(skill.name)}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

interface ATSFriendlyPDFGeneratorProps {
  content: ResumeContent;
  customizationOptions: CustomizationOptions;
  fileName?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * ATS-Friendly PDF Generator component that creates text-based, selectable PDFs
 * that can be parsed by Applicant Tracking Systems
 */
const ATSFriendlyPDFGenerator: React.FC<ATSFriendlyPDFGeneratorProps> = ({
  content,
  customizationOptions,
  fileName = 'resume.pdf',
  className,
  children,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create and download the PDF when the button is clicked
  const generatePDF = async () => {
    try {
      // Update state to show loading
      setIsGenerating(true);
      setError(null);

      console.log('Starting PDF generation');
      
      // Create the PDF document
      const resumeDocument = (
        <ResumeDocument 
          content={content}
          customizationOptions={customizationOptions}
        />
      );
      
      // Generate PDF blob
      const blob = await pdf(resumeDocument).toBlob();
      console.log('PDF blob created successfully');
      
      // Create URL for download
      const url = URL.createObjectURL(blob);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up after download
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setIsGenerating(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setIsGenerating(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="text-xs text-red-500 mb-2">
          Error: {error}
        </div>
      )}
      
      <button
        className={className || "flex items-center px-6 py-3 text-white rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 font-medium"}
        onClick={generatePDF}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader className="w-5 h-5 mr-2 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="w-5 h-5 mr-2" />
            {children || 'Download ATS-Friendly Resume'}
          </>
        )}
      </button>
    </div>
  );
};

export default ATSFriendlyPDFGenerator;
