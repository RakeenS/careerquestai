import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { ResumeContent } from '../types';

interface ResumeTemplateProps {
  content: ResumeContent;
}

const ClassicResumeTemplate: React.FC<ResumeTemplateProps> = ({ content }) => {
  const renderContent = (html: string | any[] | undefined) => {
    // Handle array type (for skills or education arrays)
    if (Array.isArray(html)) {
      return null; // Let the component handle array rendering directly
    }
    // Return null for empty content
    if (!html || html === '<p><br></p>') {
      return null;
    }
    
    // Check if the content contains bullet points
    const containsBullets = html.includes('<ul>') || html.includes('<li>');
    
    if (containsBullets) {
      // If content already has HTML bullet points, render it directly
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
    <div className="bg-white p-8 shadow-lg max-w-4xl mx-auto font-serif">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{content.name || 'Your Name'}</h1>
        <p className="text-xl text-gray-600">{content.jobTitle || 'Your Job Title'}</p>
        <div className="flex justify-center space-x-4 mt-2 text-gray-600">
          <span className="flex items-center"><Mail size={16} className="mr-1" /> {content.email || 'email@example.com'}</span>
          <span className="flex items-center"><Phone size={16} className="mr-1" /> {content.phone || '(123) 456-7890'}</span>
          <span className="flex items-center"><MapPin size={16} className="mr-1" /> {content.location || 'City, State'}</span>
        </div>
      </header>
      <section className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-1">Professional Summary</h2>
        {renderContent(content.summary) || <p className="text-gray-500 italic">Add your professional summary here</p>}
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-1">Skills</h2>
        {content.skills && content.skills.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {content.skills.map(skill => (
              <li key={skill.id} className="flex items-center">
                <span className="font-medium">{skill.name}</span>
                {skill.level && (
                  <span className="ml-2 text-sm text-gray-600">
                    ({['Beginner', 'Intermediate', 'Advanced', 'Expert'][parseInt(skill.level.toString()) - 1]})
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">Add your skills here</p>
        )}
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-1">Work Experience</h2>
        {content.experience.length > 0 ? (
          content.experience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <h3 className="text-lg font-semibold">{exp.jobTitle} at {exp.employer}</h3>
              <p className="text-gray-600 mb-2">{exp.startDate} - {exp.endDate}</p>
              {renderContent(exp.description)}
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">Add your work experience here</p>
        )}
      </section>
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-1">Education</h2>
        {content.education && content.education.length > 0 ? (
          content.education.map((edu) => (
            <div key={edu.id} className="mb-4">
              <h3 className="text-lg font-semibold">{edu.degree} in {edu.fieldOfStudy}</h3>
              <p className="text-gray-600 mb-2">{edu.school} | {edu.startDate} - {edu.endDate}</p>
              {renderContent(edu.description)}
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">Add your education here</p>
        )}
      </section>
    </div>
  );
};

export default ClassicResumeTemplate;