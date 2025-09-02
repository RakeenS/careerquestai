// Shared types for the resume builder application

// Resume content type
export interface ResumeContent {
  id?: string;
  user_id?: string;
  name: string;
  jobTitle?: string;
  professionalSummary?: string;
  skills?: string[];
  experience?: {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education?: {
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
    description?: string;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
    description?: string;
  }[];
  metadata?: {
    lastModified?: string;
    version?: number;
    theme?: string;
  };
  [key: string]: any; // To allow for additional fields
}

// Interview type
export interface Interview {
  id?: string | number;
  job_application_id?: string;
  user_id?: string;
  company: string;
  position: string;
  date: string;
  type: 'phone' | 'video' | 'onsite' | 'technical' | 'other';
  notes?: string;
  completed?: boolean;
  created_at?: string;
  last_updated?: string;
}

// Job application type
export interface JobApplication {
  id?: string | number;
  user_id?: string;
  company: string;
  position: string;
  date: string;
  status: "to_apply" | "applied" | "interviewing" | "offer" | "rejected" | string;
  salaryMin?: string;
  salaryMax?: string;
  notes?: string;
  skills?: string[];
  favorite?: boolean;
  created_at?: string;
  last_updated?: string;
}

// User goal type
export interface UserGoal {
  id?: string | number;
  user_id?: string;
  title: string;
  target: number;
  current: number;
  due_date?: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

// User activity type
export interface UserActivity {
  id?: string | number;
  user_id?: string;
  type: 'resume' | 'interview' | 'favorite' | 'application' | 'goal' | string;
  action: string;
  details?: any;
  created_at?: string;
}

// User stats type
export interface UserStats {
  resumes_count?: number;
  applications_count?: number;
  interviews_completed?: number;
  job_offers?: number;
  last_login?: string;
}
