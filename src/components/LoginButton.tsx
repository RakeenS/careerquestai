import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect, isAuthenticated, isLoading, error } = useAuth0();

  const handleLogin = async () => {
    try {
      await loginWithRedirect();
    } catch (e) {
      console.error("Login error:", e);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isAuthenticated) {
    return <div>You are logged in!</div>;
  }

  return <button onClick={handleLogin}>Log In</button>;
};

export default LoginButton;