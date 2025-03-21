import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

/**
 * Decodes a JWT token and returns the payload
 * @param token JWT token string
 * @returns Decoded token payload as an object
 */
function decodeJwt(token: string): any {
  try {
    // JWT tokens are made of three parts: header.payload.signature
    // We only need the payload which is the second part
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }

    // The payload is base64 encoded
    const base64Payload = parts[1];
    // Replace characters that might cause issues in atob
    const base64 = base64Payload.replace(/-/g, "+").replace(/_/g, "/");
    // Decode the base64 string
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    // Parse the JSON payload
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT token:", error);
    return null;
  }
}

// Mock expiration option - when true, the token will expire in 60 seconds
// This is set to false by default and can be enabled for testing
let MOCK_EXPIRATION = false;
let MOCK_EXPIRATION_TIME = 60 * 1000; // 60 seconds in milliseconds

/**
 * Function to enable mock expiration for testing
 * @param enable Whether to enable mocking
 * @param durationMs Mock expiration duration in milliseconds (default: 60000ms = 1 minute)
 */
export function setMockExpiration(enable: boolean, durationMs: number = 60000) {
  MOCK_EXPIRATION = enable;
  MOCK_EXPIRATION_TIME = durationMs;
  console.log(`Mock expiration ${enable ? 'enabled' : 'disabled'}, duration: ${durationMs}ms`);
}

/**
 * Higher Order Component (HOC) that adds authentication validation to a component
 * Checks token expiration and redirects to home page if token is expired
 */
function withAuth<P extends {}>(Component: React.ComponentType<P>): React.ComponentType<P> {
  // Define the HOC component with proper display name for debugging
  function WithAuthComponent(props: P) {
    const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState<boolean>(true);
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [mockExpTime, setMockExpTime] = useState<number | null>(null);

    useEffect(() => {
      let intervalId: number;

      const checkTokenValidity = () => {
        const token = localStorage.getItem("blockus_access_token");
        
        // If no token exists, redirect to home page
        if (!token) {
          setIsTokenValid(false);
          setIsChecking(false);
          setLocation("/");
          return;
        }

        // Decode token and check expiration
        const decoded = decodeJwt(token);
        
        // If decoding failed or there's no expiration date, consider token invalid
        if (!decoded || !decoded.exp) {
          setIsTokenValid(false);
          setIsChecking(false);
          handleLogout();
          return;
        }

        // Calculate real token expiration
        const realExpirationTime = decoded.exp * 1000;
        let currentTime = Date.now();
        let expirationTime = realExpirationTime;
        
        // When mock expiration is enabled, use mock timing for testing
        if (MOCK_EXPIRATION) {
          if (!mockExpTime) {
            // Initialize mock expiration time (current time + mock duration)
            const newMockTime = Date.now() + MOCK_EXPIRATION_TIME;
            setMockExpTime(newMockTime);
            expirationTime = newMockTime;
          } else {
            expirationTime = mockExpTime;
          }
        }
        
        // Check if token is expired
        if (currentTime >= expirationTime) {
          setIsTokenValid(false);
          setIsChecking(false);
          handleLogout();
        } else {
          setIsTokenValid(true);
          setIsChecking(false);
        }
      };

      const handleLogout = () => {
        // Clear token from localStorage
        localStorage.removeItem("blockus_access_token");
        localStorage.removeItem("blockus_user_id");
        
        // Redirect to home page
        setLocation("/");
        
        // Show toast notification
        toast({
          variant: "destructive",
          title: "Session Expired",
          description: "Your session has expired. Please login again.",
        });
      };

      // Check token validity immediately
      checkTokenValidity();
      
      // Set up interval to check token validity every second
      intervalId = window.setInterval(checkTokenValidity, 1000);

      // Cleanup interval on component unmount
      return () => {
        if (intervalId) {
          window.clearInterval(intervalId);
        }
      };
    }, [setLocation, toast]);

    // Show loading or nothing while checking
    if (isChecking) {
      return null; // Or a loading spinner if desired
    }

    // Only render the protected component if token is valid
    return isTokenValid ? <Component {...props} /> : null;
  };
  
  // Set a display name for the HOC for better debugging
  const wrappedComponentName = Component.displayName || Component.name || 'Component';
  WithAuthComponent.displayName = `withAuth(${wrappedComponentName})`;
  
  return WithAuthComponent;
}

export default withAuth;