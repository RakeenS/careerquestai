import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Link } from '@react-pdf/renderer';
import type { ResumeContent } from '../../types';

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ]
});

interface ModernResumePDFProps {
  content: ResumeContent;
  customizationOptions: {
    primaryColor: string;
    secondaryColor: string;
    fontSize: string;
    lineSpacing: string;
  };
}

const ModernResumePDF: React.FC<ModernResumePDFProps> = ({ content, customizationOptions }) => {
  // Convert fontSize string to numerical value
  const getFontSize = (size: string) => {
    const sizes = {
      'small': 0.9,
      'medium': 1,
      'large': 1.1,
    };
    return sizes[size as keyof typeof sizes] || 1;
  };
  
  // Calculate line spacing
  const getLineHeight = (spacing: string) => {
    const spacings = {
      'tight': 1.2,
      'normal': 1.5,
      'relaxed': 1.8,
    };
    return spacings[spacing as keyof typeof spacings] || 1.5;
  };
  
  // Create styles using customization options
  const baseFontSize = getFontSize(customizationOptions.fontSize);
  const baseLineHeight = getLineHeight(customizationOptions.lineSpacing);
  
  const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontFamily: 'Roboto',
      fontSize: 10 * baseFontSize,
      lineHeight: baseLineHeight,
      color: customizationOptions.secondaryColor,
    },
    header: {
      marginBottom: 20,
    },
    name: {
      fontSize: 24 * baseFontSize,
      fontWeight: 700,
      marginBottom: 5,
      color: customizationOptions.primaryColor,
    },
    jobTitle: {
      fontSize: 16 * baseFontSize,
      fontWeight: 500,
      marginBottom: 10,
    },
    contactInfo: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 5,
    },
    contactItem: {
      fontSize: 10 * baseFontSize,
    },
    section: {
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 14 * baseFontSize,
      fontWeight: 700,
      marginBottom: 8,
      color: customizationOptions.primaryColor,
      borderBottom: `1pt solid ${customizationOptions.primaryColor}`,
      paddingBottom: 2,
    },
    experienceItem: {
      marginBottom: 10,
    },
    expTitle: {
      fontSize: 12 * baseFontSize,
      fontWeight: 700,
    },
    expEmployer: {
      fontSize: 12 * baseFontSize,
      fontWeight: 500,
    },
    expDates: {
      fontSize: 10 * baseFontSize,
      fontWeight: 400,
      fontStyle: 'italic',
      marginBottom: 5,
    },
    expDescription: {
      fontSize: 10 * baseFontSize,
      marginBottom: 5,
      lineHeight: baseLineHeight,
    },
    skillsCategory: {
      marginBottom: 8,
    },
    skillsCategoryName: {
      fontWeight: 700,
      marginBottom: 3,
    },
    skillsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    skillItem: {
      fontSize: 10 * baseFontSize,
      backgroundColor: '#f0f0f0',
      padding: '3 6',
      borderRadius: 3,
    },
    educationItem: {
      marginBottom: 10,
    },
    eduDegree: {
      fontSize: 12 * baseFontSize,
      fontWeight: 700,
    },
    eduSchool: {
      fontSize: 12 * baseFontSize,
      fontWeight: 500,
    },
    eduDates: {
      fontSize: 10 * baseFontSize,
      fontWeight: 400,
      fontStyle: 'italic',
      marginBottom: 5,
    },
    eduDescription: {
      fontSize: 10 * baseFontSize,
      marginBottom: 5,
    },
    link: {
      color: customizationOptions.primaryColor,
      textDecoration: 'none',
    },
  });

  // Helper function to clean HTML content
  const cleanHtmlContent = (htmlString: string | undefined): string => {
    if (!htmlString) return '';
    
    // Create a temporary div to parse HTML (this actually runs in the browser)
    if (typeof window !== 'undefined') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlString;
      return tempDiv.textContent || tempDiv.innerText || '';
    }
    
    // Basic HTML tag removal as a fallback
    return htmlString.replace(/<[^>]*>/g, '');
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{content.name}</Text>
          <Text style={styles.jobTitle}>{content.jobTitle}</Text>
          
          <View style={styles.contactInfo}>
            {content.email && <Text style={styles.contactItem}>{content.email}</Text>}
            {content.phone && <Text style={styles.contactItem}>{content.phone}</Text>}
            {content.location && <Text style={styles.contactItem}>{content.location}</Text>}
          </View>
          
          <View style={styles.contactInfo}>
            {content.linkedin && (
              <Link src={content.linkedin} style={styles.link}>LinkedIn</Link>
            )}
            {content.github && (
              <Link src={content.github} style={styles.link}>GitHub</Link>
            )}
            {content.website && (
              <Link src={content.website} style={styles.link}>Website</Link>
            )}
          </View>
        </View>

        {content.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SUMMARY</Text>
            <Text>{cleanHtmlContent(content.summary)}</Text>
          </View>
        )}

        {content.experience && content.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EXPERIENCE</Text>
            
            {content.experience.map((exp, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.expTitle}>{exp.jobTitle}</Text>
                  <Text style={styles.expEmployer}>{exp.employer}</Text>
                </View>
                <Text style={styles.expDates}>{exp.startDate} - {exp.endDate || 'Present'}</Text>
                <Text style={styles.expDescription}>{cleanHtmlContent(exp.description)}</Text>
              </View>
            ))}
          </View>
        )}

        {content.education && content.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EDUCATION</Text>
            
            {content.education.map((edu, index) => (
              <View key={index} style={styles.educationItem}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.eduDegree}>{edu.degree}</Text>
                  <Text style={styles.eduSchool}>{edu.school}</Text>
                </View>
                <Text style={styles.eduDates}>{edu.startDate} - {edu.endDate || 'Present'}</Text>
                {edu.description && (
                  <Text style={styles.eduDescription}>{cleanHtmlContent(edu.description)}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {content.skills && content.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SKILLS</Text>
            
            {/* Group skills by category */}
            {Object.entries(
              content.skills.reduce((acc, skill) => {
                if (!acc[skill.category]) {
                  acc[skill.category] = [];
                }
                acc[skill.category].push(skill);
                return acc;
              }, {} as Record<string, typeof content.skills>)
            ).map(([category, skills], index) => (
              <View key={index} style={styles.skillsCategory}>
                <Text style={styles.skillsCategoryName}>{category}</Text>
                <View style={styles.skillsRow}>
                  {skills.map((skill, skillIndex) => (
                    <Text key={skillIndex} style={styles.skillItem}>
                      {skill.name}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default ModernResumePDF;
