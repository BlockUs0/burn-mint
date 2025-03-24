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
    console.log(`Login with token, expires in ${expiresIn} seconds`);
    
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
    
    // Show a toast notification if we have access to window
    if (typeof window !== 'undefined' && window.showExpirationToast) {
      window.showExpirationToast();
    }
    
    navigate('/'); // Redirect to home page
  };
  
  // Function to set up token expiration timer
  const setupExpirationTimer = (expiresIn: number) => {
    // Clear any existing timers
    if (window.tokenExpirationTimer) {
      clearTimeout(window.tokenExpirationTimer);
    }
    
    // Use the provided expiresIn parameter (in seconds) and convert to milliseconds
    const expirationTime = expiresIn * 1000;
    
    console.log(`Setting up token expiration timer for ${expiresIn} seconds`);
    
    // Set timeout to logout when token expires
    window.tokenExpirationTimer = setTimeout(() => {
      console.log('Token expired, logging out...');
      logout();
    }, expirationTime);
  };
  
  // On component mount, check if token exists and set up expiration timer
  useEffect(() => {
    console.log('AuthContext useEffect running, token:', token ? 'exists' : 'not found');
    
    if (token) {
      try {
        // Use the actual JWT expiration time
        try {
          // Decode the JWT token
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          console.log('Decoded token data in useEffect:', tokenData);
          
          // Get expiration time
          const expiresAt = tokenData.exp * 1000; // Convert to milliseconds
          const currentTime = Date.now();
          
          console.log('Token expires at:', new Date(expiresAt).toLocaleTimeString());
          console.log('Current time:', new Date(currentTime).toLocaleTimeString());
          console.log('Time remaining:', Math.round((expiresAt - currentTime) / 1000), 'seconds');
          
          if (expiresAt > currentTime) {
            // Token is still valid, set up expiration timer with 2-minute buffer
            const timeRemaining = expiresAt - currentTime;
            const expiryTimeWithBuffer = Math.floor(timeRemaining / 1000) - 120; // 2-minute buffer
            
            // Ensure we have a minimum expiry time
            const finalExpiryTime = expiryTimeWithBuffer < 10 ? 10 : expiryTimeWithBuffer;
            console.log('Setting timer with buffer:', finalExpiryTime, 'seconds');
            
            setupExpirationTimer(finalExpiryTime);
          } else {
            // Token has already expired
            console.log('Token has already expired');
            logout();
          }
        } catch (decodeError) {
          console.error('Error decoding JWT token:', decodeError);
          // Continue with a default timeout if decoding fails
          console.log('Using default 60 second expiration timer due to decode error');
          setupExpirationTimer(60);
        }
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
    showExpirationToast: () => void;
  }
}