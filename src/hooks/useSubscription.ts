import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

type SubscriptionStatus = {
  isPremium: boolean;
  isLoading: boolean;
  error: string | null;
};

/**
 * Hook to check if a user has access to premium features
 * 
 * NOTE: Currently all users have premium access regardless of subscription status
 */
export function useSubscription(): SubscriptionStatus {
  // Always return isPremium as true to give all users access to premium features
  return { 
    isPremium: true, 
    isLoading: false, 
    error: null 
  };
}
