import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';

// Define the type for our context
interface AuthContextType {
  isAuthenticated: boolean;
  sessionExpiry: Date | null;
  timeRemaining: number | null; // in seconds
  logout: () => void;
  refreshSession: () => void;
}

// Session timeout in minutes (30 minutes default)
const SESSION_TIMEOUT_MINUTES = 30;
// Warning threshold in minutes (5 minutes before expiry)
const WARNING_THRESHOLD_MINUTES = 5;

// Create the context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { disconnect } = useWallet();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [warningShown, setWarningShown] = useState<boolean>(false);

  // Function to check token validity
  const checkTokenValidity = () => {
    console.log("Checking token validity...");
    const token = localStorage.getItem('blockus_access_token');
    
    if (!token) {
      console.log("No token found in localStorage");
      setIsAuthenticated(false);
      setSessionExpiry(null);
      return false;
    }
    
    // If there's a token but no session expiry yet, set it
    if (!sessionExpiry) {
      const newExpiry = new Date();
      newExpiry.setMinutes(newExpiry.getMinutes() + SESSION_TIMEOUT_MINUTES);
      setSessionExpiry(newExpiry);
      setIsAuthenticated(true);
      return true;
    }
    
    return true;
  };

  // Function to compute time remaining in seconds
  const calculateTimeRemaining = () => {
    if (!sessionExpiry) return null;
    
    const now = new Date();
    const diffMs = sessionExpiry.getTime() - now.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    return diffSeconds > 0 ? diffSeconds : 0;
  };

  // Refresh the session time
  const refreshSession = () => {
    const newExpiry = new Date();
    newExpiry.setMinutes(newExpiry.getMinutes() + SESSION_TIMEOUT_MINUTES);
    setSessionExpiry(newExpiry);
    setWarningShown(false);
    setIsAuthenticated(true);
    
    console.log(`Session refreshed. New expiry: ${newExpiry.toLocaleTimeString()}`);
  };

  // Logout function
  const logout = () => {
    disconnect();
    setIsAuthenticated(false);
    setSessionExpiry(null);
    setTimeRemaining(null);
    setWarningShown(false);
    
    console.log("User logged out due to session expiry");
  };

  // Check token on component mount and when token changes
  useEffect(() => {
    const isValid = checkTokenValidity();
    setIsAuthenticated(isValid);
    
    // Set up listener for storage changes (if user logs out in another tab)
    const handleStorageChange = () => {
      checkTokenValidity();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Timer effect to update time remaining and check session expiry
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      
      // Log out if time remaining is 0
      if (remaining === 0) {
        logout();
        toast({
          title: 'Session Expired',
          description: 'Your session has expired. Please log in again.',
          variant: 'destructive',
        });
      } 
      // Show warning when approaching expiry
      else if (remaining !== null && 
               remaining <= WARNING_THRESHOLD_MINUTES * 60 && 
               !warningShown) {
        setWarningShown(true);
        toast({
          title: 'Session Expiring Soon',
          description: `Your session will expire in ${Math.floor(remaining / 60)} minutes. Activity will refresh your session.`,
          variant: 'default',
        });
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, sessionExpiry, warningShown]);

  // Context value that will be provided
  const contextValue: AuthContextType = {
    isAuthenticated,
    sessionExpiry,
    timeRemaining,
    logout,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}