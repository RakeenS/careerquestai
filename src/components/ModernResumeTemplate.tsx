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

const ModernResumeTemplate: React.FC<ResumeTemplateProps> = ({ content, customizationOptions }) => {
  const renderContent = (html: string | string[] | undefined) => {
    // Handle array type (for skills or education arrays)
    if (Array.isArray(html)) {
      return (
        <ul className="list-disc list-inside">
          {html.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
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

  const renderSkills = () => {
    if (!Array.isArray(content.skills) || content.skills.length === 0) {
      return <p className="text-gray-500 italic">Add your skills here</p>;
    }
    
    // Group skills by category
    const skillsByCategory = content.skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, typeof content.skills>);
    
    return (
      <div className="space-y-4">
        {Object.entries(skillsByCategory).map(([category, skills]) => (
          <div key={category} className="mb-2">
            <h3 className="text-md font-medium mb-1">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <div 
                  key={skill.id} 
                  className="rounded-full px-3 py-1 text-sm" 
                  style={{ 
                    backgroundColor: customizationOptions.secondaryColor,
                    color: customizationOptions.primaryColor
                  }}
                >
                  {skill.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEducation = (education: any) => {
    if (Array.isArray(education)) {
      return (
        <ul className="list-none">
          {education.map((edu, index) => (
            <li key={index} className="mb-2">
              <h3 className="text-lg font-semibold">{edu.school}</h3>
              <p>{edu.degree} in {edu.fieldOfStudy}</p>
              <p>{edu.startDate} - {edu.endDate}</p>
              {renderContent(edu.description)}
            </li>
          ))}
        </ul>
      );
    } else if (typeof education === 'string') {
      return renderContent(education);
    }
    return null;
  };

  return (
    <div className="bg-white p-8 shadow-lg max-w-4xl mx-auto font-sans" style={{
      lineHeight: customizationOptions.lineSpacing,
      fontSize: customizationOptions.fontSize,
    }}>
      <div className="border-l-4 pl-4 mb-8" style={{ borderColor: customizationOptions.primaryColor }}>
        <h1 className="text-4xl font-bold text-gray-800">{content.name || 'Your Name'}</h1>
        <p className="text-xl text-gray-600">{content.jobTitle || 'Your Job Title'}</p>
      </div>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 border-b-2 pb-2" style={{ color: customizationOptions.primaryColor, borderColor: customizationOptions.secondaryColor }}>Professional Summary</h2>
            {renderContent(content.summary) || <p className="text-gray-500 italic">Add your professional summary here</p>}
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 border-b-2 pb-2" style={{ color: customizationOptions.primaryColor, borderColor: customizationOptions.secondaryColor }}>Work Experience</h2>
            {content.experience.length > 0 ? (
              content.experience.map((exp) => (
                <div key={exp.id} className="mb-4">
                  <h3 className="text-lg font-semibold">{exp.jobTitle} at {exp.employer}</h3>
                  <p className="text-gray-600">{exp.startDate} - {exp.endDate}</p>
                  {renderContent(exp.description)}
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">Add your work experience here</p>
            )}
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4 border-b-2 pb-2" style={{ color: customizationOptions.primaryColor, borderColor: customizationOptions.secondaryColor }}>Education</h2>
            {renderEducation(content.education) || <p className="text-gray-500 italic">Add your education here</p>}
          </section>
        </div>
        <div>
          <section className="mb-8 bg-gray-100 p-4 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 border-b-2 pb-2" style={{ color: customizationOptions.primaryColor, borderColor: customizationOptions.secondaryColor }}>Contact</h2>
            <ul className="text-gray-700 space-y-2">
              <li className="flex items-center">
                <Mail className="mr-2" size={18} style={{ color: customizationOptions.primaryColor }} />
                {content.email || 'email@example.com'}
              </li>
              <li className="flex items-center">
                <Phone className="mr-2" size={18} style={{ color: customizationOptions.primaryColor }} />
                {content.phone || '(123) 456-7890'}
              </li>
              <li className="flex items-center">
                <MapPin className="mr-2" size={18} style={{ color: customizationOptions.primaryColor }} />
                {content.location || 'City, State'}
              </li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 border-b-2 pb-2" style={{ color: customizationOptions.primaryColor, borderColor: customizationOptions.secondaryColor }}>Skills</h2>
            {renderSkills()}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ModernResumeTemplate;