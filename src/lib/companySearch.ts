/**
 * Company Search Utility
 * Provides functions to search for company information using multiple sources
 * 1. Wikipedia API (primary source)
 * 2. Serpstack API (fallback)
 */

import { supabase } from './supabaseClient';

// Define an interface for company information returned
export interface CompanyInfo {
  name: string;
  description: string;
  industry?: string;
  headquarters?: string;
  founded?: string;
  employees?: string;
  website?: string;
  source?: string;
}

// Base URL for Wikipedia API
const WIKIPEDIA_API_BASE = 'https://en.wikipedia.org/api/rest_v1/page/summary/';

/**
 * Check if a query is likely asking about a company
 * @param query - The search query
 * @returns True if the query is likely about a company
 */
export function isLikelyCompanyQuery(query: string): boolean {
  // Lower case for case-insensitive comparison
  const lowercaseQuery = query.toLowerCase();
  
  // Company identifiers
  const companyIdentifiers = [
    'inc',
    'inc.',
    'incorporated',
    'company',
    'co',
    'co.',
    'corporation',
    'corp',
    'corp.',
    'llc',
    'ltd',
    'limited',
    'gmbh'
  ];
  
  // Check if any company identifier is present
  if (companyIdentifiers.some(identifier => lowercaseQuery.includes(` ${identifier}`) || lowercaseQuery.endsWith(` ${identifier}`))) {
    return true;
  }
  
  // Get known companies and check if query contains any of them
  const knownCompanies = Object.keys(getKnownCompanies());
  if (knownCompanies.some(company => lowercaseQuery.includes(company))) {
    return true;
  }
  
  // Check for common patterns like "about [company]" or "[company] in [location]"
  if (/\babout\s+[\w\s]+\b/i.test(lowercaseQuery) || /\b[\w\s]+\s+in\s+[\w\s,]+\b/i.test(lowercaseQuery)) {
    return true;
  }
  
  return false;
}

/**
 * Get a location string from state and city
 * @param state - State code
 * @param city - City name
 * @returns Formatted location string
 */
export function formatLocation(state?: string, city?: string): string {
  if (city && state) {
    return `${city}, ${state}`;
  } else if (state) {
    return state;
  } else if (city) {
    return city;
  }
  return '';
}

/**
 * Get a dictionary of known companies and their descriptions
 * @returns Record of company names to descriptions
 */
const getKnownCompanies = (): Record<string, string> => {
  return {
    "motic": "Motic is a manufacturer of conventional compound microscopes, digital microscopes, and related products. The company specializes in optical instruments for education, healthcare, and industrial applications.",
    "zoho": "Zoho Corporation is a multinational technology company that offers a suite of business software applications including CRM, project management, accounting, and collaboration tools.",
    "atlassian": "Atlassian is an Australian software company that develops products for software developers, project managers, and other software development teams, including Jira and Confluence.",
    "zendesk": "Zendesk is a customer service software company that offers a cloud-based help desk management solution that includes ticketing, self-service options, and customer support features.",
    "hubspot": "HubSpot is an American developer and marketer of software products for inbound marketing, sales, and customer service, known for its CRM platform.",
    "tableau": "Tableau Software is an interactive data visualization software company focused on business intelligence, acquired by Salesforce.",
    "twilio": "Twilio is an American cloud communications platform as a service company that allows software developers to programmatically make and receive phone calls, send and receive text messages, and perform other communication functions.",
    "tesla": "Tesla, Inc. is an American electric vehicle and clean energy company founded by Elon Musk. It designs and manufactures electric cars, battery energy storage systems, solar panels and solar roof tiles.",
    "apple": "Apple Inc. is a multinational technology company that designs, manufactures, and markets consumer electronics, computer software, and online services.",
    "google": "Google (Alphabet Inc.) is a multinational technology company specializing in Internet-related services and products, including online advertising technologies, search engine, cloud computing, software, and hardware.",
    "microsoft": "Microsoft Corporation is a multinational technology company that develops, manufactures, licenses, supports, and sells computer software, consumer electronics, personal computers, and related services.",
    "amazon": "Amazon.com, Inc. is a multinational technology company focusing on e-commerce, cloud computing, digital streaming, and artificial intelligence.",
    "meta": "Meta Platforms, Inc. (formerly Facebook) is a multinational technology conglomerate focusing on social media, virtual reality, and metaverse technologies.",
    "netflix": "Netflix, Inc. is a subscription streaming service and production company that offers a library of films and television series."
  };
};

/**
 * Search for company information from various sources
 * @param companyName - Name of the company
 * @param location - Optional location information
 * @returns Promise resolving to company information
 */
export async function searchCompanyInfo(companyName: string, location?: string): Promise<CompanyInfo> {
  console.log(`Searching for company: ${companyName}, location: ${location || 'N/A'}`);
  
  // Remove common terms like "about" or "information about" from company name
  const cleanedName = companyName
    .replace(/\b(information|about|info)\s+\b/gi, '')
    .replace(/\s+in\s+[\w\s,]+$/i, '')
    .trim();
  
  // Check our known companies dictionary first
  const knownCompanies = getKnownCompanies();
  const knownCompanyMatch = Object.keys(knownCompanies).find(
    key => cleanedName.toLowerCase().includes(key.toLowerCase())
  );
  
  if (knownCompanyMatch) {
    console.log(`Found known company match: ${knownCompanyMatch}`);
    return {
      name: cleanedName,
      description: knownCompanies[knownCompanyMatch],
      source: 'internal database'
    };
  }
  
  // Try Wikipedia API
  try {
    console.log(`Trying Wikipedia API for: ${cleanedName}`);
    const response = await fetch(`${WIKIPEDIA_API_BASE}${encodeURIComponent(cleanedName)}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.extract && !data.extract.toLowerCase().includes('may refer to')) {
        console.log(`Found Wikipedia information for: ${cleanedName}`);
        return {
          name: data.title || cleanedName,
          description: data.extract,
          source: 'Wikipedia'
        };
      }
    }
  } catch (error) {
    console.error('Error fetching from Wikipedia:', error);
  }
  
  // If we get here, we don't have good information
  // Create a generic description with the location if available
  let genericDescription = `Information about ${cleanedName}`;
  if (location) {
    genericDescription += ` in ${location}`;
  }
  
  console.log(`Using generic description for: ${cleanedName}`);
  return {
    name: cleanedName,
    description: genericDescription,
    source: 'generic'
  };
}

/**
 * Search Wikipedia for company information
 * @param searchTerm - Term to search on Wikipedia
 * @returns Partial CompanyInfo or null if not found
 */
async function searchWikipedia(searchTerm: string): Promise<{name: string, description: string, logo?: string, url?: string} | null> {
  try {
    const encodedTerm = encodeURIComponent(searchTerm);
    const url = `${WIKIPEDIA_API_BASE}${encodedTerm}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`Wikipedia API returned ${response.status} for "${searchTerm}"`);
      return null;
    }
    
    const data = await response.json();
    
    // Ensure we have an extract (description)
    if (!data.extract) {
      return null;
    }
    
    const result = {
      name: data.title || searchTerm,
      description: data.extract,
      url: data.content_urls?.desktop?.page
    };
    
    // Add thumbnail if available
    if (data.thumbnail && data.thumbnail.source) {
      return {
        ...result,
        logo: data.thumbnail.source
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching from Wikipedia:', error);
    return null;
  }
} 