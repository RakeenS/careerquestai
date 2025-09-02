import React from 'react';
import { Mail, Phone, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { ResumeContent } from '../types';

interface ResumeTemplateProps {
  content: ResumeContent;
}

const CreativeResumeTemplate: React.FC<ResumeTemplateProps> = ({ content }) => {
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
    <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-8 shadow-lg max-w-4xl mx-auto font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-purple-800 mb-2">{content.name || 'Your Name'}</h1>
        <p className="text-2xl text-pink-600 font-light">{content.jobTitle || 'Your Job Title'}</p>
        <div className="flex justify-center space-x-4 mt-4 text-gray-700">
          <span className="flex items-center"><Mail size={18} className="mr-2 text-purple-500" /> {content.email || 'email@example.com'}</span>
          <span className="flex items-center"><Phone size={18} className="mr-2 text-purple-500" /> {content.phone || '(123) 456-7890'}</span>
          <span className="flex items-center"><MapPin size={18} className="mr-2 text-purple-500" /> {content.location || 'City, State'}</span>
        </div>
      </header>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <section className="mb-8 bg-white bg-opacity-50 rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center">
              <Briefcase className="mr-2" /> Professional Summary
            </h2>
            {renderContent(content.summary) || <p className="text-gray-600 italic">Add your professional summary here</p>}
          </section>
          <section className="mb-8 bg-white bg-opacity-50 rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center">
              <Briefcase className="mr-2" /> Work Experience
            </h2>
            {content.experience.length > 0 ? (
              content.experience.map((exp) => (
                <div key={exp.id} className="mb-6">
                  <h3 className="text-xl font-semibold text-pink-600">{exp.jobTitle}</h3>
                  <p className="text-gray-700 mb-2">{exp.employer} | {exp.startDate} - {exp.endDate}</p>
                  {renderContent(exp.description)}
                </div>
              ))
            ) : (
              <p className="text-gray-600 italic">Add your work experience here</p>
            )}
          </section>
        </div>
        <div>
          <section className="mb-8 bg-white bg-opacity-50 rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-bold text-purple-700 mb-4">Skills</h2>
            {renderContent(content.skills) || <p className="text-gray-600 italic">Add your skills here</p>}
          </section>
          <section className="mb-8 bg-white bg-opacity-50 rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center">
              <GraduationCap className="mr-2" /> Education
            </h2>
            {renderContent(content.education) || <p className="text-gray-600 italic">Add your education here</p>}
          </section>
        </div>
      </div>
    </div>
  );
};

export default CreativeResumeTemplate;