/**
 * Utility function to fix the "Cannot find droppable entry with id [applied]" error
 * 
 * This function takes any status string and ensures it's in the correct format
 * for react-beautiful-dnd to work properly with our Kanban board.
 */

// The allowed status values - must match exactly what's in JobTracker.tsx
const ALLOWED_STATUSES = {
  TO_APPLY: 'to_apply',
  APPLIED: 'applied',
  INTERVIEWING: 'interviewing',
  OFFER: 'offer',
  REJECTED: 'rejected'
};

/**
 * Clean and normalize a status string to ensure it matches our allowed values
 */
export function fixStatusForDragDrop(status: string): string {
  // Special case for parsing droppable IDs from react-beautiful-dnd
  // Sometimes they come in various formats including with brackets
  if (status?.startsWith('[') && status?.endsWith(']')) {
    const innerStatus = status.substring(1, status.length - 1).toLowerCase().trim();
    console.log(`Found status in brackets: [${innerStatus}], normalizing`);
    // Try to match the inner status to our allowed values
    return fixStatusForDragDrop(innerStatus); // Recursive call without brackets
  }
  
  console.log(`Normalizing status: ${status}`);
  
  // Handle null or undefined values
  if (!status) {
    console.log('Status was null/undefined, defaulting to APPLIED');
    return ALLOWED_STATUSES.APPLIED;
  }
  
  // First, remove any brackets, extra spaces, and normalize casing
  const cleanStatus = status.replace(/[\[\]]/g, '').trim().toLowerCase();
  console.log(`Cleaned status: ${cleanStatus}`);
  
  // Check for direct exact matches first (highest priority)
  if (Object.values(ALLOWED_STATUSES).includes(cleanStatus)) {
    console.log(`Direct exact match found for status: ${cleanStatus}`);
    return cleanStatus; // Return the exact matching status
  }
  
  // Handle specific status mappings with more variations
  // TO_APPLY variations
  if (cleanStatus === 'to apply' || 
      cleanStatus === 'toapply' || 
      cleanStatus === 'to_apply' || 
      cleanStatus === 'to-apply' ||
      cleanStatus === 'wishlist' ||
      cleanStatus === 'interested' ||
      cleanStatus === 'bookmarked' ||
      cleanStatus === 'saved') {
    console.log(`Mapped '${cleanStatus}' to TO_APPLY`);
    return ALLOWED_STATUSES.TO_APPLY;
  }
  
  // APPLIED variations
  if (cleanStatus === 'applied' ||
      cleanStatus === 'application sent' ||
      cleanStatus === 'application submitted' ||
      cleanStatus === 'submit' ||
      cleanStatus === 'submitted') {
    console.log(`Mapped '${cleanStatus}' to APPLIED`);
    return ALLOWED_STATUSES.APPLIED;
  }
  
  // INTERVIEWING variations
  if (cleanStatus === 'interviewing' ||
      cleanStatus === 'interview' ||
      cleanStatus === 'interviews' ||
      cleanStatus === 'upcoming' || 
      cleanStatus === '1st round completed' || 
      cleanStatus === 'waiting on final results' || 
      cleanStatus === '1stroundcompleted' || 
      cleanStatus === 'waitingonfinalresults' ||
      cleanStatus === 'in progress' ||
      cleanStatus === 'phone screen' ||
      cleanStatus === 'technical' ||
      cleanStatus === 'onsite' ||
      cleanStatus === 'interview scheduled') {
    console.log(`Mapped '${cleanStatus}' to INTERVIEWING`);
    return ALLOWED_STATUSES.INTERVIEWING;
  }
  
  // OFFER variations
  if (cleanStatus === 'offer' ||
      cleanStatus === 'offers' ||
      cleanStatus === 'offer received' || 
      cleanStatus === 'offerreceived' ||
      cleanStatus === 'accepted') {
    console.log(`Mapped '${cleanStatus}' to OFFER`);
    return ALLOWED_STATUSES.OFFER;
  }
  
  // REJECTED variations
  if (cleanStatus === 'rejected' ||
      cleanStatus === 'rejection' ||
      cleanStatus === 'did not get' || 
      cleanStatus === 'didnotget' ||
      cleanStatus === 'declined' ||
      cleanStatus === 'not selected' ||
      cleanStatus === 'not moving forward') {
    console.log(`Mapped '${cleanStatus}' to REJECTED`);
    return ALLOWED_STATUSES.REJECTED;
  }
  
  // If all else fails, default to APPLIED as a safe fallback
  console.log(`No match found for status: ${status}, defaulting to APPLIED`);
  return ALLOWED_STATUSES.APPLIED;
}

/**
 * Get all columns with proper keys for the Kanban board
 */
export function getEmptyColumns(): Record<string, any[]> {
  return {
    [ALLOWED_STATUSES.TO_APPLY]: [],
    [ALLOWED_STATUSES.APPLIED]: [],
    [ALLOWED_STATUSES.INTERVIEWING]: [],
    [ALLOWED_STATUSES.OFFER]: [],
    [ALLOWED_STATUSES.REJECTED]: []
  };
}

// Export the allowed statuses for reference
export { ALLOWED_STATUSES };
