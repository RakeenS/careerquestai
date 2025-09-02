import React from 'react';
import { useAuth } from '../context/AuthContext';
import UnauthenticatedLanding from './UnauthenticatedLanding';

interface AuthGuardProps {
  children: React.ReactNode;
  showLanding?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, showLanding = false }) => {
  const { user } = useAuth();

  if (!user) {
    if (showLanding) {
      return <UnauthenticatedLanding />;
    }
    return <UnauthenticatedLanding />;
  }

  return <>{children}</>;
};

export default AuthGuard;