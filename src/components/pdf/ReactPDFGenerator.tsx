import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet,
  PDFDownloadLink
  // Font - Uncomment if you need custom fonts
} from '@react-pdf/renderer';
import { ResumeContent, CustomizationOptions, Experience, Education, Skill } from '../../types';

// Register fonts if needed
// Font.register({
//   family: 'Open Sans',
//   fonts: [
//     { src: '/fonts/OpenSans-Regular.ttf' },
//     { src: '/fonts/OpenSans-Bold.ttf', fontWeight: 'bold' },
//   ],
// });

interface ReactPDFGeneratorProps {
  content: ResumeContent;
  customizationOptions: CustomizationOptions;
  selectedTemplate: string;
  fileName?: string;
}

// Create styles
const createStyles = (options: CustomizationOptions) => {
  // Get font size in points based on customization option
  const getFontSize = (size: string): number => {
    switch (size) {
      case 'small': return 9;
      case 'medium': return 10;
      case 'large': return 12;
      default: return 10;
    }
  };

  // Get line height based on customization option
  const getLineHeight = (spacing: string): number => {
    switch (spacing) {
      case 'compact': return 1.2;
      case 'normal': return 1.5;
      case 'spacious': return 1.8;
      default: return 1.5;
    }
  };

  const baseSize = getFontSize(options.fontSize);
  const lineHeight = getLineHeight(options.lineSpacing);
  const fontFamily = options.fontFamily || 'Helvetica';
  const primaryColor = options.primaryColor || '#2563eb';

  return StyleSheet.create({
    page: {
      padding: 30,
      fontFamily: fontFamily,
      fontSize: baseSize,
      lineHeight: lineHeight,
      color: '#333',
    },
    section: {
      marginBottom: 10,
    },
    header: {
      fontSize: baseSize + 6,
      fontWeight: 'bold',
      marginBottom: 5,
      color: primaryColor,
    },
    subheader: {
      fontSize: baseSize + 2,
      fontWeight: 'bold',
      marginBottom: 5,
      marginTop: 10,
      color: primaryColor,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      paddingBottom: 2,
    },
    sectionTitle: {
      fontSize: baseSize + 1,
      fontWeight: 'bold',
      marginBottom: 3,
      marginTop: 8,
      color: primaryColor,
    },
    normalText: {
      fontSize: baseSize,
      marginBottom: 3,
    },
    boldText: {
      fontWeight: 'bold',
    },
    italicText: {
      fontStyle: 'italic',
      fontSize: baseSize - 1,
      marginBottom: 5,
    },
    contactInfo: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    contactItem: {
      marginRight: 10,
      marginBottom: 5,
      fontSize: baseSize - 1,
    },
    bullet: {
      width: 10,
      marginRight: 5,
    },
    bulletContent: {
      flexDirection: 'row',
      marginBottom: 3,
      paddingLeft: 10,
    },
    bulletText: {
      flex: 1,
    },
    bulletPoint: {
      width: 8,
      marginRight: 5,
    },
    bulletList: {
      marginTop: 5,
      marginBottom: 5,
    }
  });
};

// Create bullet point list component
const BulletList = ({ items, styles }: { items: string[], styles: any }) => {
  return (
    <View style={styles.bulletList}>
      {items.map((item, index) => (
        <View key={index} style={styles.bulletContent}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
};

// Create experience item component
const ExperienceItem = ({ experience, styles }: { experience: Experience, styles: any }) => {
  // Parse the description to extract bullet points if present
  const descriptionItems = experience.description
    ? experience.description.split(/(?:\r\n|\r|\n|•|-)+/).filter(item => item.trim().length > 0)
    : [];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {experience.jobTitle} {experience.employer ? `at ${experience.employer}` : ''}
      </Text>
      <Text style={styles.italicText}>
        {experience.startDate} - {experience.endDate || (experience.current ? 'Present' : '')}
        {experience.location ? ` | ${experience.location}` : ''}
      </Text>
      
      {descriptionItems.length > 0 ? (
        <BulletList items={descriptionItems} styles={styles} />
      ) : (
        <Text style={styles.normalText}>{experience.description}</Text>
      )}
      
      {experience.achievements && experience.achievements.length > 0 && (
        <BulletList items={experience.achievements} styles={styles} />
      )}
    </View>
  );
};

// Create education item component
const EducationItem = ({ education, styles }: { education: Education, styles: any }) => {
  // Parse the description to extract bullet points if present
  const descriptionItems = education.description
    ? education.description.split(/(?:\r\n|\r|\n|•|-)+/).filter(item => item.trim().length > 0)
    : [];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {education.degree}{education.fieldOfStudy ? ` in ${education.fieldOfStudy}` : ''}{education.school ? ` at ${education.school}` : ''}
      </Text>
      <Text style={styles.italicText}>
        {education.startDate} - {education.endDate}
        {education.location ? ` | ${education.location}` : ''}
        {education.gpa ? ` | GPA: ${education.gpa}` : ''}
      </Text>
      
      {descriptionItems.length > 0 ? (
        <BulletList items={descriptionItems} styles={styles} />
      ) : (
        <Text style={styles.normalText}>{education.description}</Text>
      )}
      
      {education.achievements && education.achievements.length > 0 && (
        <BulletList items={education.achievements} styles={styles} />
      )}
    </View>
  );
};

// Generate PDF Document
const MyDocument = ({ content, customizationOptions }: ReactPDFGeneratorProps) => {
  const styles = createStyles(customizationOptions);
  
  // Split summary into paragraphs
  const summaryParagraphs = content.summary 
    ? content.summary.split(/(?:\r\n|\r|\n)+/).filter(p => p.trim().length > 0)
    : [];

  // Group skills by category
  const skillsByCategory: Record<string, Skill[]> = {};
  content.skills.forEach(skill => {
    const category = skill.category || 'Other';
    if (!skillsByCategory[category]) {
      skillsByCategory[category] = [];
    }
    skillsByCategory[category].push(skill);
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with name and job title */}
        <View style={styles.section}>
          <Text style={styles.header}>{content.name}</Text>
          <Text style={styles.normalText}>{content.jobTitle}</Text>
        </View>
        
        {/* Contact Information */}
        <View style={styles.contactInfo}>
          {content.email && <Text style={styles.contactItem}>Email: {content.email}</Text>}
          {content.phone && <Text style={styles.contactItem}>Phone: {content.phone}</Text>}
          {content.location && <Text style={styles.contactItem}>Location: {content.location}</Text>}
          {content.linkedin && <Text style={styles.contactItem}>LinkedIn: {content.linkedin}</Text>}
          {content.github && <Text style={styles.contactItem}>GitHub: {content.github}</Text>}
          {content.website && <Text style={styles.contactItem}>Website: {content.website}</Text>}
        </View>
        
        {/* Professional Summary */}
        {content.summary && (
          <View style={styles.section}>
            <Text style={styles.subheader}>Professional Summary</Text>
            {summaryParagraphs.map((paragraph, index) => (
              <Text key={index} style={styles.normalText}>{paragraph}</Text>
            ))}
          </View>
        )}
        
        {/* Experience */}
        {content.experience && content.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subheader}>Work Experience</Text>
            {content.experience.map((exp, index) => (
              <ExperienceItem key={index} experience={exp} styles={styles} />
            ))}
          </View>
        )}
        
        {/* Skills */}
        {content.skills && content.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subheader}>Skills</Text>
            {Object.entries(skillsByCategory).map(([category, skills]) => (
              <View key={category} style={styles.section}>
                {Object.keys(skillsByCategory).length > 1 && (
                  <Text style={styles.sectionTitle}>{category}</Text>
                )}
                <BulletList 
                  items={skills.map(skill => skill.name)} 
                  styles={styles} 
                />
              </View>
            ))}
          </View>
        )}
        
        {/* Education */}
        {content.education && content.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subheader}>Education</Text>
            {content.education.map((edu, index) => (
              <EducationItem key={index} education={edu} styles={styles} />
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};

// PDF Download component
const ReactPDFGenerator: React.FC<ReactPDFGeneratorProps & { className?: string; children?: React.ReactNode; isPrinting: boolean }> = ({
  content,
  customizationOptions,
  selectedTemplate,
  fileName = 'resume.pdf',
  className,
  children,
  isPrinting
}) => {
  return (
    <PDFDownloadLink
      document={
        <MyDocument 
          content={content} 
          customizationOptions={customizationOptions}
          selectedTemplate={selectedTemplate}
        />
      }
      fileName={fileName}
      className={className || "flex items-center px-6 py-3 text-white rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 font-medium"}
      style={{ textDecoration: 'none' }}
    >
      {({ loading }) => {
        // Use an effect to dispatch events when loading status changes
        if (typeof window !== 'undefined') {
          if (loading) {
            // Signal PDF generation started
            const event = new Event('resume-pdf-generation-start');
            window.dispatchEvent(event);
          }
        }
        
        return children || (
          <React.Fragment>
            {loading || isPrinting ? 'Generating PDF...' : 'Download Resume PDF'}
          </React.Fragment>
        );
      }}
    </PDFDownloadLink>
  );
};

export default ReactPDFGenerator;
