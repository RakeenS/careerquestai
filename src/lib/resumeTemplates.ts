import { ResumeTemplate } from '../types';

export const templates: ResumeTemplate[] = [
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    description: 'Clean and professional design with a modern touch',
    thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=200',
    category: 'Professional',
    features: [
      'Clean typography',
      'Professional layout',
      'ATS-friendly',
      'Customizable colors'
    ],
    popularityScore: 95,
    isNew: false
  },
  {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    description: 'Stand out with a creative yet professional design',
    thumbnail: 'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?q=80&w=200',
    category: 'Creative',
    features: [
      'Unique layout',
      'Portfolio section',
      'Visual elements',
      'Personal branding'
    ],
    popularityScore: 88,
    isNew: true
  },
  // Add more templates...
];

export const fonts = [
  { id: 'inter', name: 'Inter', category: 'sans-serif' },
  { id: 'roboto', name: 'Roboto', category: 'sans-serif' },
  { id: 'playfair', name: 'Playfair Display', category: 'serif' },
  { id: 'source-code', name: 'Source Code Pro', category: 'monospace' }
];

export const colorSchemes = [
  {
    id: 'professional-blue',
    name: 'Professional Blue',
    colors: {
      primary: '#0ea5e9',
      secondary: '#e0f2fe',
      accent: '#0369a1'
    }
  },
  {
    id: 'modern-purple',
    name: 'Modern Purple',
    colors: {
      primary: '#8b5cf6',
      secondary: '#ede9fe',
      accent: '#6d28d9'
    }
  },
  // Add more color schemes...
];

export const layouts = [
  {
    id: 'single-column',
    name: 'Single Column',
    description: 'Traditional layout, perfect for most professional roles'
  },
  {
    id: 'two-column',
    name: 'Two Column',
    description: 'Modern layout with efficient space usage'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean and focused design with essential information'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Unique layout for creative professionals'
  }
];

export function getTemplateById(id: string): ResumeTemplate | undefined {
  return templates.find(template => template.id === id);
}

export function getRecommendedTemplate(industry: string, role: string): ResumeTemplate {
  // Implement template recommendation logic based on industry and role
  return templates[0];
}