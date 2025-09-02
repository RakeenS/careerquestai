/**
 * Simple utility to ensure consistent status strings throughout the application
 * This fixes the "Cannot find droppable entry with id [applied]" error
 */

// Define the exact status strings to use consistently
export const STATUS_VALUES = {
  TO_APPLY: 'to_apply',
  APPLIED: 'applied',
  INTERVIEWING: 'interviewing',
  OFFER: 'offer',
  REJECTED: 'rejected'
};

/**
 * Normalize a status value to a consistent string format
 */
export function normalizeStatus(status: string): string {
  // Handle null/undefined
  if (!status) return STATUS_VALUES.APPLIED;
  
  // Remove any brackets and trim
  const cleaned = status.replace(/[\[\]]/g, '').trim();
  
  // Match to our allowed values
  switch (cleaned) {
    case 'to_apply':
    case 'to apply':
      return STATUS_VALUES.TO_APPLY;
    case 'applied':
      return STATUS_VALUES.APPLIED;
    case 'interviewing':
    case 'upcoming':
    case '1st round completed':
    case 'waiting on final results':
      return STATUS_VALUES.INTERVIEWING;
    case 'offer':
    case 'offer received':
      return STATUS_VALUES.OFFER;
    case 'rejected':
    case 'did not get':
      return STATUS_VALUES.REJECTED;
    default:
      return STATUS_VALUES.APPLIED; // Default fallback
  }
}
