/**
 * Helper utilities for user access management
 * All users now have free access to premium features
 */

/**
 * Check if a user has premium status
 * Returns true for all users since features are now free
 */
export const checkPremiumStatus = async (userId: string) => {
  // All users have premium access for free
  return true;
};

/**
 * Utility to check if code is running in development environment
 */
export function isDevelopment() {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
}