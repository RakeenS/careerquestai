export interface Experience {
  id: string;
  employer: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  description: string;
  location?: string;
  achievements?: string[];
  technologies?: string[];
  order?: number;
  current?: boolean;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
  location?: string;
  gpa?: string;
  achievements?: string[];
  order?: number;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 1-5
  category: string;
  order?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  startDate?: string;
  endDate?: string;
  order?: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  link?: string;
  order?: number;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic';
  order?: number;
}

export interface CustomizationOptions {
  primaryColor: string;
  secondaryColor: string;
  fontSize: string;
  lineSpacing: string;
  fontFamily: string;
  spacing: string;
}

export interface ResumeMetadata {
  createdAt: string;
  lastModified: string;
  tags: string[];
}

export interface ResumeContent {
  id: string;
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary: string;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
  interests?: string[];
  references?: string;
  customSections?: {
    id: string;
    title: string;
    content: string;
    order: number;
  }[];
  lastUpdated?: string;
  fileUrl?: string;
  templateId: string;
  customization: CustomizationOptions;
  metadata: ResumeMetadata;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'Professional' | 'Creative' | 'Modern' | 'Simple' | 'Academic';
  features: string[];
  popularityScore: number;
  isNew?: boolean;
}

export interface ResumeAnalysis {
  score: number;
  suggestions: {
    category: string;
    items: {
      type: 'success' | 'warning' | 'error';
      message: string;
      suggestion?: string;
    }[];
  }[];
  keywords: {
    found: string[];
    missing: string[];
  };
  atsCompatibility: {
    score: number;
    issues: string[];
  };
  readability: {
    score: number;
    suggestions: string[];
  };
}

/**
 * Base interface for job application data with common fields
 */
export interface JobApplicationBase {
  id: string | number;
  company: string;
  position: string;
  date: string;
  status: string;
  notes?: string;
  skills?: string[];
  favorite?: boolean;
}

/**
 * Front-end focused job application interface using camelCase
 * Used primarily in React components
 */
export interface JobApplication extends JobApplicationBase {
  salaryMin?: string;
  salaryMax?: string;
  userId?: string;
  createdAt?: string;
  lastUpdated?: string;
  // Keep snake_case versions for backward compatibility during transition
  salary_min?: string;
  salary_max?: string;
  user_id?: string;
  created_at?: string;
  last_updated?: string;
}

/**
 * Database focused job application interface using snake_case
 * Used specifically for Supabase operations
 */
export interface JobApplicationForUpsert extends JobApplicationBase {
  user_id: string;
  salary_min?: string | null;
  salary_max?: string | null;
  created_at?: string;
  last_updated?: string;
  updated_at: string;
  // Additional internal fields for Supabase operations
  _created_at?: string; // Alternate field name sometimes used
  _updated_at?: string; // Alternate field name sometimes used
}

/**
 * Legacy interface - maintained for backward compatibility
 * @deprecated Use JobApplication instead
 */
export interface Interview extends JobApplicationBase {
  userId?: string;
  user_id?: string;
  salary_min?: string;
  salary_max?: string;
  salaryMin?: string;
  salaryMax?: string;
  last_updated?: string;
  created_at?: string;
  updated_at?: string;
  skills?: string[];
  favorite?: boolean;
}

export interface UserGoal {
  id?: string | number;
  user_id: string;
  title: string;
  target: number;
  current: number;
  due_date?: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserActivity {
  id?: string | number;
  user_id: string;
  type: string;
  action: string;
  details?: any;
  created_at?: string;
  related_entity_id?: string;
  related_entity_type?: string;
}

export interface UserStats {
  resumes_count?: number;
  applications_count?: number;
  interviews_completed?: number; 
  job_offers?: number;
  last_login?: string;
  [key: string]: any; // Allow for dynamic properties
}