import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PremiumGuardProps {
  children: React.ReactNode;
}

/**
 * A component that guards premium features, ensuring only users with active subscriptions can access them.
 * If a user is not logged in, they are redirected to the login page.
 * 
 * NOTE: Premium check is currently disabled - all users have access to premium features.
 */
const PremiumGuard: React.FC<PremiumGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  // Set hasSubscription to true for all users to allow access to premium features
  const [hasSubscription, setHasSubscription] = useState(true);

  // If no user, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // All users now have access to premium features
  return <>{children}</>;
};

export default PremiumGuard;
