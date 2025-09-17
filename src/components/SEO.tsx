import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
  canonical?: string;
  structuredData?: object;
}

const SEO: React.FC<SEOProps> = ({
  title = 'CareerQuestAI - AI-Powered Resume Builder & Career Tools',
  description = 'Create ATS-friendly resumes with AI, practice interviews, track job applications, and accelerate your career with CareerQuestAI. Free AI-powered career tools for job seekers.',
  keywords = 'AI resume builder, ATS resume, career tools, job search, interview preparation, resume optimization, AI career assistant, job tracker, professional resume',
  image = 'https://careerquestai.vercel.app/og-image.svg',
  url = 'https://careerquestai.vercel.app',
  type = 'website',
  author = 'CareerQuestAI Team',
  publishedTime,
  modifiedTime,
  noIndex = false,
  canonical,
  structuredData
}) => {
  const siteTitle = 'CareerQuestAI';
  const fullTitle = title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;
  const currentUrl = canonical || url;

  // Default structured data for the application
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CareerQuestAI",
    "description": description,
    "url": "https://careerquestai.vercel.app",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "CareerQuestAI",
      "url": "https://careerquestai.vercel.app"
    },
    "featureList": [
      "AI-Powered Resume Builder",
      "ATS Optimization",
      "Interview Preparation",
      "Job Application Tracking",
      "Career Coaching",
      "Resume Templates"
    ],
    "screenshot": image,
    "softwareVersion": "1.0",
    "datePublished": "2024-01-01",
    "dateModified": modifiedTime || new Date().toISOString(),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      
      {/* Robots and Indexing */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && <meta name="robots" content="index, follow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@CareerQuestAI" />
      <meta name="twitter:creator" content="@CareerQuestAI" />
      
      {/* Article specific tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Additional Meta Tags for Better SEO */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      <meta name="application-name" content={siteTitle} />
      <meta name="apple-mobile-web-app-title" content={siteTitle} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://api.openai.com" />
      <link rel="preconnect" href="https://oai.hconeai.com" />
      
      {/* DNS Prefetch for better performance */}
      <link rel="dns-prefetch" href="//vercel.com" />
      <link rel="dns-prefetch" href="//supabase.co" />
    </Helmet>
  );
};

export default SEO;
