import React from 'react';
import { Mail, MapPin, Phone, Calendar, Globe, Link } from 'lucide-react';
import { ResumeContent } from '../types';

interface ResumeTemplateProps {
  content: ResumeContent;
}

const ProfessionalResumeTemplate: React.FC<ResumeTemplateProps> = ({ content }) => {
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
    <div className="bg-white p-8 shadow-lg max-w-4xl mx-auto font-sans">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 uppercase">{content.name || 'YOUR NAME'}</h1>
          <h2 className="text-2xl text-gray-600 mt-2 uppercase">{content.jobTitle || 'Your Job Title'}</h2>
        </div>
        <div className="w-32 h-32 bg-gray-300 rounded-full overflow-hidden">
          {/* Placeholder for profile picture */}
          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
            Photo
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-1">
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 uppercase">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <Mail size={14} className="mr-2 text-gray-500" />
                {content.email || 'email@example.com'}
              </li>
              <li className="flex items-center text-sm">
                <Phone size={14} className="mr-2 text-gray-500" />
                {content.phone || '(123) 456-7890'}
              </li>
              <li className="flex items-center text-sm">
                <MapPin size={14} className="mr-2 text-gray-500" />
                {content.location || 'City, State'}
              </li>
              <li className="flex items-center text-sm">
                <Calendar size={14} className="mr-2 text-gray-500" />
                {/* Placeholder for birth date */}
                Jan 1, 1990
              </li>
              <li className="flex items-center text-sm">
                <Globe size={14} className="mr-2 text-gray-500" />
                {/* Placeholder for nationality */}
                American
              </li>
              <li className="flex items-center text-sm">
                <Link size={14} className="mr-2 text-gray-500" />
                {/* Placeholder for website */}
                www.example.com
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 uppercase">Skills</h3>
            {renderContent(content.skills) || (
              <ul className="list-disc list-inside text-sm">
                <li>Skill 1</li>
                <li>Skill 2</li>
                <li>Skill 3</li>
                <li>Skill 4</li>
                <li>Skill 5</li>
              </ul>
            )}
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 uppercase">Languages</h3>
            <ul className="text-sm">
              <li>English | Native</li>
              <li>Spanish | Elementary</li>
            </ul>
          </section>
        </div>

        <div className="col-span-2">
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 uppercase">Objective</h3>
            {renderContent(content.summary) || (
              <p className="text-sm">
                Certified professional with X years of experience. Adapts seamlessly to constantly evolving processes and new technologies. Detail-oriented, efficient, and organized, with extensive experience in various systems. Specialized in specific areas of expertise.
              </p>
            )}
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 uppercase">Experience</h3>
            {content.experience.length > 0 ? (
              content.experience.map((exp) => (
                <div key={exp.id} className="mb-4">
                  <h4 className="text-md font-semibold">{exp.jobTitle}</h4>
                  <p className="text-sm text-gray-600">{exp.employer} | {exp.startDate} - {exp.endDate}</p>
                  {renderContent(exp.description) || (
                    <ul className="list-disc list-inside text-sm mt-2">
                      <li>Responsibility or achievement 1</li>
                      <li>Responsibility or achievement 2</li>
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">Add your work experience here</p>
            )}
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 uppercase">Education</h3>
            {renderContent(content.education) || (
              <div>
                <h4 className="text-md font-semibold">Degree Name</h4>
                <p className="text-sm text-gray-600">University Name, Location | Graduation Date</p>
                <p className="text-sm mt-2">Brief description or notable achievements during your education.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalResumeTemplate;