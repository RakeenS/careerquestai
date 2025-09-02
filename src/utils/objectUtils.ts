/**
 * Utilities for efficient object operations
 */

/**
 * Creates a deep clone of an object using the structured clone method if available,
 * falling back to a more careful approach than JSON.parse/stringify for older browsers.
 * 
 * @param obj The object to clone
 * @returns A deep clone of the object
 */
export function deepClone<T>(obj: T): T {
  // Use the modern structuredClone if available (most browsers)
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(obj);
    } catch (err) {
      console.warn('structuredClone failed, falling back to custom implementation', err);
      // Fall through to the custom implementation
    }
  }
  
  // For simple values, just return them
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // Handle Date objects
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  // Handle Array objects
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  // Handle plain objects
  const clone = {} as Record<string, any>;
  
  // Copy all properties 
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone((obj as Record<string, any>)[key]);
    }
  }
  
  return clone as T;
}

/**
 * An implementation of Immer-like immutable state updates.
 * Takes a state object and a producer function that can "mutate" a draft.
 * 
 * @param state The current state
 * @param producer A function that can "mutate" the draft state
 * @returns A new state object with the changes
 */
export function produceImmutable<T>(state: T, producer: (draft: T) => void): T {
  // Create a deep clone to serve as our "draft"
  const draft = deepClone(state);
  
  // Allow the producer to "mutate" our draft
  producer(draft);
  
  // Return the mutated draft as our new state
  return draft;
}
