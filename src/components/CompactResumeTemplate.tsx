import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { ResumeContent } from '../types';

interface ResumeTemplateProps {
  content: ResumeContent;
  customizationOptions: {
    lineSpacing: string;
    fontSize: string;
    primaryColor: string;
    secondaryColor: string;
  };
}

const CompactResumeTemplate: React.FC<ResumeTemplateProps> = ({ content, customizationOptions }) => {
  const renderContent = (html: string | any[] | undefined) => {
    // Handle array type (for skills or education arrays)
    if (Array.isArray(html)) {
      return null; // Let the component handle array rendering directly
    }
    
    // Return null for empty content
    if (!html || html.trim() === '' || html === '<p><br></p>') {
      return null;
    }
    
    // Check if the content contains bullet points in HTML format
    const containsBullets = html.includes('<ul>') || html.includes('<li>');
    
    if (containsBullets) {
      // If content already has HTML bullet points, render it directly with a special class
      return <div className="bullet-points" dangerouslySetInnerHTML={{ __html: html }} />;
    } else if (html.includes('•') || html.includes('- ')) {
      // Handle plain text bullet points
      // Split by bullet markers and filter out empty lines
      const lines = html
        .split(/[•\-]\s*/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      if (lines.length > 1) {
        return (
          <ul className="list-disc pl-5 space-y-1">
            {lines.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        );
      }
    }
    
    // Default: render as regular HTML
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="bg-white p-6 shadow-lg max-w-3xl mx-auto font-sans" style={{
      lineHeight: customizationOptions.lineSpacing,
      fontSize: customizationOptions.fontSize,
    }}>
      <header className="text-center mb-4">
        <h1 className="text-2xl font-bold" style={{ color: customizationOptions.primaryColor }}>{content.name || 'Your Name'}</h1>
        <p className="text-gray-600">{content.jobTitle || 'Your Job Title'}</p>
        <div className="flex justify-center space-x-4 mt-2 text-gray-600 text-xs">
          <span className="flex items-center"><Mail size={12} className="mr-1" style={{ color: customizationOptions.primaryColor }} /> {content.email || 'email@example.com'}</span>
          <span className="flex items-center"><Phone size={12} className="mr-1" style={{ color: customizationOptions.primaryColor }} /> {content.phone || '(123) 456-7890'}</span>
          <span className="flex items-center"><MapPin size={12} className="mr-1" style={{ color: customizationOptions.primaryColor }} /> {content.location || 'City, State'}</span>
        </div>
      </header>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <section className="mb-4">
            <h2 className="text-lg font-semibold mb-2" style={{ color: customizationOptions.primaryColor }}>Professional Summary</h2>
            {renderContent(content.summary) || <p className="text-gray-600 italic">Add your professional summary here</p>}
          </section>
          <section className="mb-4">
            <h2 className="text-lg font-semibold mb-2" style={{ color: customizationOptions.primaryColor }}>Experience</h2>
            {content.experience.length > 0 ? (
              content.experience.map((exp) => (
                <div key={exp.id} className="mb-3">
                  <h3 className="font-semibold">{exp.jobTitle} at {exp.employer}</h3>
                  <p className="text-xs text-gray-600">{exp.startDate} - {exp.endDate}</p>
                  {renderContent(exp.description)}
                </div>
              ))
            ) : (
              <p className="text-gray-600 italic">Add your work experience here</p>
            )}
          </section>
        </div>
        <div>
          <section className="mb-4">
            <h2 className="text-lg font-semibold mb-2" style={{ color: customizationOptions.primaryColor }}>Education</h2>
            {content.education.length > 0 ? (
              content.education.map((edu) => (
                <div key={edu.id} className="mb-3">
                  <h3 className="font-semibold">{edu.school}</h3>
                  <p className="text-xs text-gray-600">{edu.degree} in {edu.fieldOfStudy}</p>
                  <p className="text-xs text-gray-600">{edu.startDate} - {edu.endDate}</p>
                  {renderContent(edu.description)}
                </div>
              ))
            ) : (
              <p className="text-gray-600 italic">Add your education here</p>
            )}
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: customizationOptions.primaryColor }}>Skills</h2>
            {renderContent(content.skills) || <p className="text-gray-600 italic">Add your skills here</p>}
          </section>
        </div>
      </div>
    </div>
  );
};

export default CompactResumeTemplate;