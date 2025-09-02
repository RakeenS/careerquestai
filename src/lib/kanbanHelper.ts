// Helper functions for the Kanban board functionality

// Define the job status constants - same as in JobTracker.tsx
export const JOB_STATUSES = {
  TO_APPLY: 'to_apply',
  APPLIED: 'applied',
  INTERVIEWING: 'interviewing',
  OFFER: 'offer',
  REJECTED: 'rejected'
};

/**
 * Normalize a status string to ensure it matches one of our defined statuses
 * This is crucial for react-beautiful-dnd to work correctly
 */
export function normalizeStatus(status: string): string {
  // Remove any brackets and trim whitespace
  const cleanStatus = (status || '').replace(/[\[\]]/g, '').trim();
  
  // Map to one of our standard statuses
  switch (cleanStatus) {
    case 'to_apply':
    case 'to apply':
      return JOB_STATUSES.TO_APPLY;
    case 'applied':
      return JOB_STATUSES.APPLIED;
    case 'interviewing':
    case 'upcoming':
    case '1st round completed':
    case 'waiting on final results':
      return JOB_STATUSES.INTERVIEWING;
    case 'offer':
    case 'offer received':
      return JOB_STATUSES.OFFER;
    case 'rejected':
    case 'did not get':
      return JOB_STATUSES.REJECTED;
    default:
      // Default to "applied" if no match is found
      return JOB_STATUSES.APPLIED;
  }
}

/**
 * Initialize empty columns for all possible statuses
 * This ensures that all columns exist for react-beautiful-dnd
 */
export function initializeEmptyColumns<T>(): Record<string, T[]> {
  const columns: Record<string, T[]> = {};
  
  Object.values(JOB_STATUSES).forEach(status => {
    columns[status] = [];
  });
  
  return columns;
}
