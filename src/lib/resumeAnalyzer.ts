import { ResumeContent, ResumeAnalysis } from '../types';
import openai from './openai';

// Helper function to format resume for AI analysis
export function formatResumeForAnalysis(resume: ResumeContent): string {
  let formattedResume = '';
  
  // Basic information
  formattedResume += `${resume.name}\n`;
  formattedResume += `${resume.jobTitle}\n`;
  formattedResume += `${resume.email} | ${resume.phone} | ${resume.location}\n`;
  
  // Social links
  const socialLinks = [];
  if (resume.linkedin) socialLinks.push(`LinkedIn: ${resume.linkedin}`);
  if (resume.github) socialLinks.push(`GitHub: ${resume.github}`);
  if (resume.portfolio) socialLinks.push(`Portfolio: ${resume.portfolio}`);
  if (resume.website) socialLinks.push(`Website: ${resume.website}`);
  
  if (socialLinks.length > 0) {
    formattedResume += `${socialLinks.join(' | ')}\n`;
  }
  
  // Summary
  if (resume.summary) {
    formattedResume += `\nSUMMARY:\n${resume.summary}\n`;
  }
  
  // Experience
  if (resume.experience && resume.experience.length > 0) {
    formattedResume += `\nEXPERIENCE:\n`;
    resume.experience.forEach(exp => {
      formattedResume += `${exp.jobTitle} | ${exp.employer} | ${exp.startDate} - ${exp.endDate || 'Present'}\n`;
      formattedResume += `${exp.location || ''}\n`;
      formattedResume += `${exp.description}\n`;
      
      if (exp.achievements && exp.achievements.length > 0) {
        exp.achievements.forEach(achievement => {
          formattedResume += `- ${achievement}\n`;
        });
      }
      
      formattedResume += '\n';
    });
  }
  
  // Education
  if (resume.education && resume.education.length > 0) {
    formattedResume += `\nEDUCATION:\n`;
    resume.education.forEach(edu => {
      formattedResume += `${edu.degree} in ${edu.fieldOfStudy} | ${edu.school} | ${edu.startDate} - ${edu.endDate || 'Present'}\n`;
      if (edu.location) formattedResume += `${edu.location}\n`;
      if (edu.gpa) formattedResume += `GPA: ${edu.gpa}\n`;
      if (edu.description) formattedResume += `${edu.description}\n`;
      
      if (edu.achievements && edu.achievements.length > 0) {
        edu.achievements.forEach(achievement => {
          formattedResume += `- ${achievement}\n`;
        });
      }
      
      formattedResume += '\n';
    });
  }
  
  // Skills
  if (resume.skills && resume.skills.length > 0) {
    formattedResume += `\nSKILLS:\n`;
    const skillsByCategory = resume.skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill.name);
      return acc;
    }, {} as Record<string, string[]>);
    
    Object.entries(skillsByCategory).forEach(([category, skills]) => {
      formattedResume += `${category}: ${skills.join(', ')}\n`;
    });
  }
  
  // Projects (if available)
  if (resume.projects && resume.projects.length > 0) {
    formattedResume += `\nPROJECTS:\n`;
    resume.projects.forEach(project => {
      formattedResume += `${project.title}\n`;
      if (project.startDate && project.endDate) {
        formattedResume += `${project.startDate} - ${project.endDate}\n`;
      }
      formattedResume += `${project.description}\n`;
      if (project.technologies && project.technologies.length > 0) {
        formattedResume += `Technologies: ${project.technologies.join(', ')}\n`;
      }
      if (project.link) {
        formattedResume += `Link: ${project.link}\n`;
      }
      formattedResume += '\n';
    });
  }
  
  return formattedResume;
}

export async function analyzeResume(resume: ResumeContent, jobDescription?: string): Promise<ResumeAnalysis> {
  try {
    // Create a structured prompt for the AI to analyze the resume
    const systemPrompt = `
      You are an expert professional resume writer and ATS specialist with 15+ years of experience.
      You critically analyze resumes for:
      
      1. Content quality and impact (use of strong action verbs, quantifiable achievements, relevant skills)
      2. Structure and formatting (readability, organization, consistent formatting)
      3. ATS compatibility (proper keywords, standard formatting, no complex elements that ATS can't parse)
      4. Overall impression (how a hiring manager would perceive this resume)
      
      Provide your analysis in the following JSON format:
      {
        "overallAssessment": "A detailed paragraph assessing the resume's overall quality",
        "contentAnalysis": {
          "strengths": ["List of strong points about the content"],
          "weaknesses": ["List of areas that need improvement"],
          "impactScore": A number 1-100 rating the impact and effectiveness of the content
        },
        "keywordAnalysis": {
          "foundKeywords": ["Important keywords found in the resume"],
          "suggestedKeywords": ["Additional keywords that should be added"],
          "keywordScore": A number 1-100 rating keyword usage and relevance
        },
        "atsCompatibility": {
          "issues": ["Any formatting or structure issues that might cause ATS problems"],
          "compatibilityScore": A number 1-100 rating how well the resume would pass ATS systems
        },
        "readability": {
          "issues": ["Any readability issues"],
          "suggestions": ["Specific suggestions to improve readability"],
          "readabilityScore": A number 1-100 rating the overall readability
        },
        "specificSuggestions": [
          {
            "section": "The section this suggestion applies to (e.g., 'summary', 'experience', 'education')",
            "suggestion": "A specific, actionable suggestion for improvement",
            "priority": "high/medium/low"
          }
        ]
      }
    `;

    // Prepare the resume content for the AI
    // Convert complex resume object to a more readable format
    const formattedResume = formatResumeForAnalysis(resume);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using the latest model for best analysis
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Please analyze this resume ${jobDescription ? 'for this job description' : ''}:
          
          === RESUME ===
          ${formattedResume}
          ${jobDescription ? `=== JOB DESCRIPTION ===\n${jobDescription}` : ''}`
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent, analytical responses
    });

    // Parse the AI response
    const analysisText = response.choices[0].message.content || '{}';
    let analysis;
    
    try {
      analysis = JSON.parse(analysisText);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('Raw AI response:', analysisText);
      
      // Fallback to a basic analysis structure if parsing fails
      analysis = {
        overallAssessment: "Could not analyze resume fully. Please try again.",
        contentAnalysis: { strengths: [], weaknesses: [], impactScore: 50 },
        keywordAnalysis: { foundKeywords: [], suggestedKeywords: [], keywordScore: 50 },
        atsCompatibility: { issues: [], compatibilityScore: 50 },
        readability: { issues: [], suggestions: [], readabilityScore: 50 },
        specificSuggestions: []
      };
    }
    
    // Transform the AI analysis into the expected ResumeAnalysis format
    return {
      score: calculateOverallScore(analysis),
      suggestions: generateSuggestions(analysis),
      keywords: {
        found: analysis.keywordAnalysis?.foundKeywords || [],
        missing: analysis.keywordAnalysis?.suggestedKeywords || []
      },
      atsCompatibility: {
        score: analysis.atsCompatibility?.compatibilityScore || 70,
        issues: analysis.atsCompatibility?.issues || []
      },
      readability: {
        score: analysis.readability?.readabilityScore || 70,
        suggestions: analysis.readability?.suggestions || []
      }
    };
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
}

function calculateOverallScore(analysis: any): number {
  // Calculate weighted average of different scores
  const weights = {
    content: 0.4,     // Content is most important
    keywords: 0.25,   // Keywords are critical for ATS
    ats: 0.2,         // ATS compatibility
    readability: 0.15 // Readability is important but less than others
  };
  
  const contentScore = analysis.contentAnalysis?.impactScore || 70;
  const keywordScore = analysis.keywordAnalysis?.keywordScore || 70;
  const atsScore = analysis.atsCompatibility?.compatibilityScore || 70;
  const readabilityScore = analysis.readability?.readabilityScore || 70;
  
  const weightedScore = 
    (contentScore * weights.content) +
    (keywordScore * weights.keywords) +
    (atsScore * weights.ats) +
    (readabilityScore * weights.readability);
  
  // Round to nearest integer
  return Math.round(weightedScore);
}

function generateSuggestions(analysis: any) {
  const suggestions: {
    category: string;
    items: {
      type: 'success' | 'warning' | 'error';
      message: string;
      suggestion?: string;
    }[];
  }[] = [];
  
  // Content suggestions
  const contentItems: {
    type: 'success' | 'warning' | 'error';
    message: string;
    suggestion?: string;
  }[] = [];
  
  // Add strengths as success items
  if (analysis.contentAnalysis?.strengths && analysis.contentAnalysis.strengths.length > 0) {
    analysis.contentAnalysis.strengths.forEach((strength: string) => {
      contentItems.push({
        type: 'success',
        message: strength
      });
    });
  }
  
  // Add weaknesses as warning items
  if (analysis.contentAnalysis?.weaknesses && analysis.contentAnalysis.weaknesses.length > 0) {
    analysis.contentAnalysis.weaknesses.forEach((weakness: string) => {
      contentItems.push({
        type: 'warning',
        message: weakness
      });
    });
  }
  
  if (contentItems.length > 0) {
    suggestions.push({
      category: 'Content',
      items: contentItems
    });
  }
  
  // ATS Compatibility suggestions
  if (analysis.atsCompatibility?.issues && analysis.atsCompatibility.issues.length > 0) {
    const atsItems = analysis.atsCompatibility.issues.map((issue: string) => ({
      type: 'warning' as 'warning',
      message: issue
    }));
    
    suggestions.push({
      category: 'ATS Compatibility',
      items: atsItems
    });
  }
  
  // Keyword suggestions
  const keywordItems: {
    type: 'success' | 'warning' | 'error';
    message: string;
    suggestion?: string;
  }[] = [];
  
  if (analysis.keywordAnalysis?.foundKeywords && analysis.keywordAnalysis.foundKeywords.length > 0) {
    keywordItems.push({
      type: 'success',
      message: `Good use of keywords: ${analysis.keywordAnalysis.foundKeywords.join(', ')}`
    });
  }
  
  if (analysis.keywordAnalysis?.suggestedKeywords && analysis.keywordAnalysis.suggestedKeywords.length > 0) {
    keywordItems.push({
      type: 'warning',
      message: `Consider adding these keywords: ${analysis.keywordAnalysis.suggestedKeywords.join(', ')}`,
      suggestion: 'Incorporate these keywords naturally throughout your resume.'
    });
  }
  
  if (keywordItems.length > 0) {
    suggestions.push({
      category: 'Keywords',
      items: keywordItems
    });
  }
  
  // Readability suggestions
  if (analysis.readability?.suggestions && analysis.readability.suggestions.length > 0) {
    const readabilityItems = analysis.readability.suggestions.map((suggestion: string) => ({
      type: 'warning' as 'warning',
      message: suggestion
    }));
    
    suggestions.push({
      category: 'Readability',
      items: readabilityItems
    });
  }
  
  // Specific section suggestions from the AI
  if (analysis.specificSuggestions && analysis.specificSuggestions.length > 0) {
    // Group by section
    const sectionSuggestions: {[key: string]: any[]} = {};
    
    analysis.specificSuggestions.forEach((item: any) => {
      const section = item.section || 'General';
      if (!sectionSuggestions[section]) {
        sectionSuggestions[section] = [];
      }
      
      sectionSuggestions[section].push({
        type: item.priority === 'high' ? 'error' : (item.priority === 'medium' ? 'warning' : 'success'),
        message: item.suggestion
      });
    });
    
    // Add each section as a category
    Object.keys(sectionSuggestions).forEach(section => {
      suggestions.push({
        category: `Improvements for ${section.charAt(0).toUpperCase() + section.slice(1)}`,
        items: sectionSuggestions[section]
      });
    });
  }
  
  return suggestions;
}

export async function optimizeForATS(resume: ResumeContent, jobDescription: string): Promise<ResumeContent> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at optimizing resumes for ATS systems while maintaining readability and impact. Return the optimized resume in valid JSON format that matches the original structure."
        },
        {
          role: "user",
          content: `Optimize this resume for the following job description:
          
          Resume: ${JSON.stringify(resume)}
          Job Description: ${jobDescription}`
        }
      ],
      temperature: 0.3,
    });

    const optimizedResumeText = response.choices[0].message.content || '{}';
    try {
      return JSON.parse(optimizedResumeText);
    } catch (error) {
      console.error('Error parsing optimized resume:', error);
      return resume; // Return original if parsing fails
    }
  } catch (error) {
    console.error('Error optimizing resume:', error);
    throw error;
  }
}

export async function generateAISuggestions(resume: ResumeContent): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert professional resume writer. Provide 5-7 specific, actionable suggestions to improve this resume. Return your response as a JSON array of strings."
        },
        {
          role: "user",
          content: `Generate improvement suggestions for this resume: ${formatResumeForAnalysis(resume)}`
        }
      ],
      temperature: 0.4,
    });

    const suggestionsText = response.choices[0].message.content || '[]';
    try {
      return JSON.parse(suggestionsText);
    } catch (error) {
      console.error('Error parsing AI suggestions:', error);
      return [
        "Make your resume more impactful by adding quantifiable achievements.",
        "Ensure your summary clearly communicates your value proposition.",
        "Review for consistent formatting throughout the document."
      ]; // Return fallback suggestions if parsing fails
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    throw error;
  }
}