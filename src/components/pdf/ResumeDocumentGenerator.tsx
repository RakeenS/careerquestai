import React, { useState, useCallback } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font, pdf } from '@react-pdf/renderer';
import { Download, Loader } from 'lucide-react';
import { ResumeContent, CustomizationOptions } from '../../types';
import { templates } from '../../templates';

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmEU9fBBc9.ttf', fontWeight: 500 },
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmWUlfBBc9.ttf', fontWeight: 700 },
  ],
});

Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/opensans/v28/mem8YaGs126MiZpBA-UFVZ0e.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/opensans/v28/mem5YaGs126MiZpBA-UNirkOUuhs.ttf', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/opensans/v28/mem5YaGs126MiZpBA-UN7rgOUuhs.ttf', fontWeight: 700 },
  ],
});

interface ResumeDocumentProps {
  content: ResumeContent;
  customizationOptions: CustomizationOptions;
  selectedTemplate: string;
}

// Create PDF document component
const ResumeDocument: React.FC<ResumeDocumentProps> = ({ content, customizationOptions, selectedTemplate }) => {
  // Convert color values from customizationOptions to usable format
  const primaryColor = customizationOptions.primaryColor;
  const fontFamily = customizationOptions.fontFamily;
  
  // Generate dynamic styles based on customization options
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      padding: 30,
      fontFamily: fontFamily,
    },
    section: {
      margin: 10,
      padding: 10,
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
      color: primaryColor,
    },
    subheader: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
      color: primaryColor,
    },
    contactInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
      fontSize: 10,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: primaryColor,
      marginBottom: 5,
      padding: 5,
      borderBottomWidth: 1,
      borderBottomColor: primaryColor,
    },
    experienceItem: {
      marginBottom: 10,
    },
    experienceTitle: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    experienceCompany: {
      fontSize: 11,
      fontWeight: 'bold',
    },
    experienceDate: {
      fontSize: 10,
      fontStyle: 'italic',
    },
    bullet: {
      fontSize: 10,
      marginLeft: 10,
      flexDirection: 'row',
    },
    bulletPoint: {
      width: 10,
    },
    bulletText: {
      flex: 1,
    },
    skillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    skillItem: {
      fontSize: 10,
      padding: 5,
      marginRight: 5,
      marginBottom: 5,
      backgroundColor: primaryColor,
      color: '#ffffff',
      borderRadius: 3,
    },
    educationItem: {
      marginBottom: 10,
    },
    educationDegree: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    educationSchool: {
      fontSize: 11,
    },
    summary: {
      fontSize: 11,
      marginBottom: 15,
      lineHeight: 1.5,
    },
  });

  // Template-specific styles could be added here
  const getTemplateStyles = () => {
    switch (selectedTemplate) {
      case 'modern':
        return {
          page: { ...styles.page, padding: 40 },
          header: { ...styles.header, fontWeight: 'bold', fontSize: 28 },
        };
      case 'professional':
        return {
          page: { ...styles.page, padding: 25 },
          header: { ...styles.header, textTransform: 'uppercase', letterSpacing: 2 },
        };
      case 'creative':
        return {
          page: { ...styles.page, paddingLeft: 50 },
          header: { ...styles.header, color: primaryColor, fontSize: 26 },
        };
      default:
        return styles;
    }
  };

  const templateStyles = getTemplateStyles();

  return (
    <Document title={`${content.name} Resume`} author={content.name} keywords="resume, cv">
      <Page size="A4" style={templateStyles.page || styles.page}>
        {/* Header with name and title */}
        <View style={styles.section}>
          <Text style={templateStyles.header || styles.header}>{content.name}</Text>
          <Text style={styles.subheader}>{content.title}</Text>
          
          {/* Contact Information */}
          <View style={styles.contactInfo}>
            <Text>{content.email}</Text>
            <Text>{content.phone}</Text>
            <Text>{content.location}</Text>
            {content.website && <Text>{content.website}</Text>}
          </View>
          
          {/* Summary */}
          {content.summary && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Professional Summary</Text>
              <Text style={styles.summary}>{content.summary}</Text>
            </View>
          )}
          
          {/* Experience */}
          {content.experience && content.experience.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Work Experience</Text>
              {content.experience.map((exp, index) => (
                <View key={index} style={styles.experienceItem}>
                  <Text style={styles.experienceTitle}>{exp.title}</Text>
                  <Text style={styles.experienceCompany}>{exp.company}</Text>
                  <Text style={styles.experienceDate}>
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </Text>
                  
                  {exp.bullets && exp.bullets.map((bullet, bIndex) => (
                    <View key={bIndex} style={styles.bullet}>
                      <Text style={styles.bulletPoint}>• </Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
          
          {/* Education */}
          {content.education && content.education.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
              {content.education.map((edu, index) => (
                <View key={index} style={styles.educationItem}>
                  <Text style={styles.educationDegree}>
                    {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                  </Text>
                  <Text style={styles.educationSchool}>{edu.school}</Text>
                  <Text style={styles.educationDate}>
                    {edu.startDate} - {edu.endDate || 'Present'}
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Skills */}
          {content.skills && content.skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.skillsContainer}>
                {content.skills.map((skill, index) => (
                  <Text key={index} style={styles.skillItem}>
                    {skill.name}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

interface ResumeDocumentGeneratorProps {
  content: ResumeContent;
  customizationOptions: CustomizationOptions;
  selectedTemplate: string;
  fileName?: string;
  className?: string;
  children?: React.ReactNode;
  onGenerateStart?: () => void;
  onGenerateEnd?: () => void;
}

/**
 * Modern PDF generator component that creates text-based PDFs with preserved styling
 */
const ResumeDocumentGenerator: React.FC<ResumeDocumentGeneratorProps> = ({
  content,
  customizationOptions,
  selectedTemplate,
  fileName = `${content.name.replace(/\s+/g, '_')}_Resume.pdf`,
  className,
  children,
  onGenerateStart,
  onGenerateEnd
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerateStart = useCallback(() => {
    setIsGenerating(true);
    if (onGenerateStart) onGenerateStart();
  }, [onGenerateStart]);
  
  const handleGenerateEnd = useCallback(() => {
    setIsGenerating(false);
    if (onGenerateEnd) onGenerateEnd();
  }, [onGenerateEnd]);
  
  // Generate a downloadable link to the PDF document
  const document = <ResumeDocument 
    content={content} 
    customizationOptions={customizationOptions}
    selectedTemplate={selectedTemplate}
  />;
  
  return (
    <div>
      {isGenerating ? (
        <button
          disabled
          className={className || "flex items-center px-6 py-3 text-white rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 font-medium"}
        >
          <Loader className="w-5 h-5 mr-2 animate-spin" />
          Generating PDF...
        </button>
      ) : (
        <PDFDownloadLink
          document={document}
          fileName={fileName}
          className={className || "flex items-center px-6 py-3 text-white rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 font-medium"}
          onClick={handleGenerateStart}
          onDownload={handleGenerateEnd}
        >
          {({ loading }) => 
            loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Preparing PDF...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                {children || 'Download Resume PDF'}
              </>
            )
          }
        </PDFDownloadLink>
      )}
    </div>
  );
};

// Static class for direct usage
export class ResumeDocumentGeneratorClass {
  static async generatePDF({ 
    content, 
    customizationOptions,
    selectedTemplate,
    fileName = `${content.name.replace(/\s+/g, '_')}_Resume.pdf`,
    onGenerateStart,
    onGenerateEnd
  }: {
    content: ResumeContent;
    customizationOptions: CustomizationOptions;
    selectedTemplate: string;
    fileName?: string;
    onGenerateStart?: () => void;
    onGenerateEnd?: () => void;
  }): Promise<boolean> {
    try {
      if (onGenerateStart) onGenerateStart();
      
      console.log('Starting professional PDF generation via class method...');
      
      // Create the document instance
      const document = <ResumeDocument 
        content={content} 
        customizationOptions={customizationOptions}
        selectedTemplate={selectedTemplate}
      />;
      
      // Generate PDF blob
      const blob = await pdf(document).toBlob();
      
      // Create a download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(link.href);
      
      console.log('PDF generated and saved successfully');
      
      if (onGenerateEnd) onGenerateEnd();
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      if (onGenerateEnd) onGenerateEnd();
      return false;
    }
  }
}

export default ResumeDocumentGenerator;
