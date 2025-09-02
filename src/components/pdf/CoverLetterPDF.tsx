// Required for JSX transforms
// @ts-ignore - React is used in JSX transformation
import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet,
  pdf
} from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40
  },
  section: {
    margin: 0,
    padding: 0,
    flexGrow: 0
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 1.5,
    textAlign: 'justify'
  }
});

// Cover Letter PDF Document component
const CoverLetterDocument = ({ content }: { content: string }) => {
  // Split the cover letter into paragraphs based on double line breaks
  const paragraphs = content.split('\n\n').map(p => p.trim()).filter(p => p.length > 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Cover Letter</Text>
          
          {paragraphs.map((paragraph, index) => (
            <Text key={`p-${index}`} style={styles.paragraph}>
              {paragraph.replace(/\n/g, ' ')}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
};

// Function to generate a PDF
export const generateCoverLetterPDF = async (
  content: string
): Promise<Blob> => {
  // Create the PDF blob with the specified content
  const blob = await pdf(<CoverLetterDocument content={content} />).toBlob();
  // Returning the blob for download with the filename used in the UI
  return blob;
};

export default CoverLetterDocument;
