import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useTokenExpiration } from '@/hooks/useTokenExpiration';

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
  const { showExpirationToast, showExpirationWarningToast } = useTokenExpiration();
  
  // Function to handle login and set up expiration timer
  const login = (accessToken: string, expiresIn: number) => {
    console.log(`Login with token, expires in ${expiresIn} seconds`);
    
    localStorage.setItem('auth_token', accessToken);
    setToken(accessToken);
    
    setupExpirationTimer(expiresIn);
  };
  
  // Function to handle logout
  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('blockus_access_token');
    localStorage.removeItem('blockus_user_id');
    setToken(null);
    
    showExpirationToast();
    
    navigate('/');
  }, [navigate, showExpirationToast]);
  
  // Function to set up token expiration timer
  const setupExpirationTimer = useCallback((expiresIn: number) => {
    if (window.tokenExpirationTimer) {
      clearTimeout(window.tokenExpirationTimer);
    }
    
    const expirationTime = expiresIn * 1000;
    
    console.log(`Setting up token expiration timer for ${expiresIn} seconds`);
    
    if (expiresIn > 30) {
      setTimeout(() => {
        console.log('Token expiring soon, showing warning...');
        showExpirationWarningToast(30);
      }, expirationTime - 30000);
    }
    
    window.tokenExpirationTimer = setTimeout(() => {
      console.log('Token expired, logging out...');
      logout();
    }, expirationTime);
  }, [logout, showExpirationWarningToast]);
  
  // On component mount, check if token exists and set up expiration timer
  useEffect(() => {
    console.log('AuthContext useEffect running, token:', token ? 'exists' : 'not found');
    
    if (token) {
      try {
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
  }, [logout, setupExpirationTimer]);
  
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