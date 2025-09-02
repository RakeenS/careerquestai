/**
 * Storage utilities for consistent data handling between localStorage and Supabase
 * This centralizes storage operations and reduces code duplication
 */

// Type for storage operations options
interface StorageOptions {
  userScoped?: boolean; // Whether to scope data to a specific user
  saveToAllLegacyKeys?: boolean; // Whether to also save to legacy keys for backwards compatibility
  expiry?: number; // Optional expiry time in milliseconds
}

// Default options
const defaultOptions: StorageOptions = {
  userScoped: true,
  saveToAllLegacyKeys: false,
  expiry: undefined
};

/**
 * Save data to localStorage with consistent key formatting and optional user scoping
 * 
 * @param key Base storage key
 * @param data Data to store
 * @param userId Optional user ID for user-scoped data
 * @param options Storage options
 * @returns void
 */
export function saveToLocalStorage<T>(
  key: string, 
  data: T, 
  userId?: string | null,
  options: StorageOptions = defaultOptions
): void {
  // Don't attempt to save if localStorage is not available
  if (typeof window === 'undefined' || !localStorage) {
    console.warn('localStorage is not available');
    return;
  }

  const serializedData = JSON.stringify(data);
  const timestamp = Date.now();
  
  // Create a storage object with metadata
  const storageObject = {
    data,
    meta: {
      updatedAt: timestamp,
      expiry: options.expiry ? timestamp + options.expiry : undefined
    }
  };

  const serializedStorage = JSON.stringify(storageObject);
  
  // Save to the primary key (either user-scoped or global)
  const primaryKey = options.userScoped && userId ? `${userId}:${key}` : key;
  localStorage.setItem(primaryKey, serializedStorage);
  
  // If we need to maintain backward compatibility, save to legacy keys as well
  if (options.saveToAllLegacyKeys) {
    // Legacy key map - defines the alternative keys that may have been used historically
    const legacyKeyMap: Record<string, string[]> = {
      'interviews': ['job_applications'],
      'job_applications': ['interviews']
    };
    
    // Save to base key if different from primary key
    if (primaryKey !== key) {
      localStorage.setItem(key, serializedStorage);
    }
    
    // Save to alternative legacy keys if they exist for this key
    const alternativeKeys = legacyKeyMap[key] || [];
    for (const altKey of alternativeKeys) {
      localStorage.setItem(altKey, serializedStorage);
      
      // Also save user-scoped version if needed
      if (options.userScoped && userId) {
        localStorage.setItem(`${userId}:${altKey}`, serializedStorage);
      }
    }
  }
}

/**
 * Load data from localStorage with consistent key formatting and optional user scoping
 * Will try multiple possible key locations based on key name and user ID
 * 
 * @param key Base storage key
 * @param userId Optional user ID for user-scoped data
 * @param options Storage options
 * @returns The stored data or null if not found or expired
 */
export function loadFromLocalStorage<T>(
  key: string, 
  userId?: string | null,
  options: StorageOptions = defaultOptions
): T | null {
  // Don't attempt to load if localStorage is not available
  if (typeof window === 'undefined' || !localStorage) {
    console.warn('localStorage is not available');
    return null;
  }
  
  // Define all possible keys to try, in order of preference
  const keysToTry: string[] = [];
  
  // User-scoped key is highest priority if user ID is available
  if (options.userScoped && userId) {
    keysToTry.push(`${userId}:${key}`);
  }
  
  // Add base key
  keysToTry.push(key);
  
  // Add alternative keys for backward compatibility
  if (options.saveToAllLegacyKeys) {
    const legacyKeyMap: Record<string, string[]> = {
      'interviews': ['job_applications'],
      'job_applications': ['interviews']
    };
    
    const alternativeKeys = legacyKeyMap[key] || [];
    for (const altKey of alternativeKeys) {
      keysToTry.push(altKey);
      
      // Add user-scoped version of alternative keys
      if (options.userScoped && userId) {
        keysToTry.push(`${userId}:${altKey}`);
      }
    }
  }
  
  // Try each key in order until we find valid data
  for (const tryKey of keysToTry) {
    const storedItem = localStorage.getItem(tryKey);
    
    if (!storedItem) continue;
    
    try {
      // Try to parse as a storage object with metadata first
      const parsed = JSON.parse(storedItem);
      
      // Check if it's our storage object format with metadata
      if (parsed && typeof parsed === 'object' && parsed.data && parsed.meta) {
        // Check for expiry if it exists
        if (parsed.meta.expiry && Date.now() > parsed.meta.expiry) {
          // Data is expired, continue to next key
          console.log(`Data for key ${tryKey} is expired`);
          continue;
        }
        
        return parsed.data as T;
      }
      
      // If not in our format, assume it's direct data (for backward compatibility)
      return parsed as T;
      
    } catch (err) {
      console.warn(`Error parsing stored data for key ${tryKey}:`, err);
      continue;
    }
  }
  
  // If we reach here, no valid data was found
  return null;
}

/**
 * Remove data from localStorage for a key and all associated legacy keys
 * 
 * @param key Base storage key
 * @param userId Optional user ID for user-scoped data
 * @param options Storage options
 * @returns void
 */
export function removeFromLocalStorage(
  key: string, 
  userId?: string | null,
  options: StorageOptions = defaultOptions
): void {
  // Don't attempt to remove if localStorage is not available
  if (typeof window === 'undefined' || !localStorage) {
    console.warn('localStorage is not available');
    return;
  }
  
  // Remove from primary key
  const primaryKey = options.userScoped && userId ? `${userId}:${key}` : key;
  localStorage.removeItem(primaryKey);
  
  // If we need to clean up all legacy keys
  if (options.saveToAllLegacyKeys) {
    // Remove from base key if different
    if (primaryKey !== key) {
      localStorage.removeItem(key);
    }
    
    // Legacy key map
    const legacyKeyMap: Record<string, string[]> = {
      'interviews': ['job_applications'],
      'job_applications': ['interviews']
    };
    
    // Remove from alternative keys
    const alternativeKeys = legacyKeyMap[key] || [];
    for (const altKey of alternativeKeys) {
      localStorage.removeItem(altKey);
      
      // Remove user-scoped version if applicable
      if (options.userScoped && userId) {
        localStorage.removeItem(`${userId}:${altKey}`);
      }
    }
  }
}
