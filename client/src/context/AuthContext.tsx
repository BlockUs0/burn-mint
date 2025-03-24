import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'wouter';

// Define the context type
interface AuthContextType {
  token: string | null;
  login: (accessToken: string, expiresIn: number) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [, navigate] = useLocation();
  
  // Function to handle login and set up expiration timer
  const login = (accessToken: string, expiresIn: number) => {
    // Store token in localStorage
    localStorage.setItem('auth_token', accessToken);
    setToken(accessToken);
    
    // Set up expiration timer
    setupExpirationTimer(expiresIn);
  };
  
  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('blockus_access_token');
    localStorage.removeItem('blockus_user_id');
    setToken(null);
    // For testing, we can console.log when logout happens
    console.log('Logged out due to token expiration');
    navigate('/'); // Redirect to home page
  };
  
  // Function to set up token expiration timer
  const setupExpirationTimer = (expiresIn: number) => {
    // Clear any existing timers
    if (window.tokenExpirationTimer) {
      clearTimeout(window.tokenExpirationTimer);
    }
    
    // Hard code to 20 seconds for testing
    const expirationTime = 20 * 1000; // 20 seconds for testing
    
    // Set timeout to logout when token expires
    window.tokenExpirationTimer = setTimeout(() => {
      console.log('Token expired, logging out...');
      logout();
    }, expirationTime);
  };
  
  // On component mount, check if token exists and set up expiration timer
  useEffect(() => {
    if (token) {
      try {
        // For testing, just set a 20-second expiration timer
        setupExpirationTimer(20); // 20 seconds
        
        // Later we will implement the JWT decoding logic
        // const tokenData = JSON.parse(atob(token.split('.')[1]));
        // const expiresAt = tokenData.exp * 1000; // Convert to milliseconds
        // const currentTime = Date.now();
        
        // if (expiresAt > currentTime) {
        //   // Token is still valid, set up expiration timer
        //   const timeRemaining = expiresAt - currentTime;
        //   setupExpirationTimer(timeRemaining / 1000); // Convert back to seconds
        // } else {
        //   // Token has already expired
        //   logout();
        // }
      } catch (error) {
        console.error('Error setting up token expiration:', error);
        logout(); // Logout on error
      }
    }
    
    // Cleanup timer on unmount
    return () => {
      if (window.tokenExpirationTimer) {
        clearTimeout(window.tokenExpirationTimer);
      }
    };
  }, []);
  
  // Add to global window interface to allow the timer
  if (typeof window !== 'undefined') {
    window.tokenExpirationTimer = window.tokenExpirationTimer || null;
  }
  
  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

// Add to the Window interface
declare global {
  interface Window {
    tokenExpirationTimer: NodeJS.Timeout | null;
  }
}