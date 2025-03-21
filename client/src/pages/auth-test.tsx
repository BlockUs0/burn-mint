import React, { useState, useEffect } from "react";
import withAuth from "@/lib/withAuth";
import { setMockExpiration } from "@/lib/withAuth";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

function AuthTestPage() {
  const [mockEnabled, setMockEnabled] = useState(false);
  const [mockDuration, setMockDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  // Update mock settings when toggled
  useEffect(() => {
    setMockExpiration(mockEnabled, mockDuration * 1000);
    
    if (mockEnabled) {
      setTimeLeft(mockDuration);
      
      // Create countdown timer
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Clean up timer
      return () => clearInterval(timer);
    } else {
      setTimeLeft(null);
    }
  }, [mockEnabled, mockDuration]);
  
  // Decode and display token info
  useEffect(() => {
    const token = localStorage.getItem("blockus_access_token");
    if (token) {
      try {
        // Decode token
        const parts = token.split(".");
        if (parts.length === 3) {
          const base64Payload = parts[1];
          const base64 = base64Payload.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            window
              .atob(base64)
              .split("")
              .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join("")
          );
          
          const decoded = JSON.parse(jsonPayload);
          setTokenInfo(decoded);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Authentication Test Page</h1>
      
      <div className="bg-card p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Token Information</h2>
        {tokenInfo ? (
          <div className="space-y-2">
            <p><strong>Subject:</strong> {tokenInfo.sub}</p>
            {tokenInfo.exp && (
              <p>
                <strong>Expires:</strong> {new Date(tokenInfo.exp * 1000).toLocaleString()}
              </p>
            )}
            <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
              {JSON.stringify(tokenInfo, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-muted-foreground">No valid token found</p>
        )}
      </div>
      
      <div className="bg-card p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Mock Expiration Testing</h2>
        <p className="mb-4">
          Enable mock expiration to test how your application behaves when a token expires.
          The actual token remains untouched, but the withAuth HOC will consider it expired
          after the specified duration.
        </p>
        
        <div className="flex items-center space-x-2 mb-4">
          <Switch 
            id="mock-switch" 
            checked={mockEnabled}
            onCheckedChange={setMockEnabled}
          />
          <Label htmlFor="mock-switch">
            {mockEnabled ? "Mock Expiration Enabled" : "Mock Expiration Disabled"}
          </Label>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="w-32">
            <Label htmlFor="duration-input">Duration (seconds)</Label>
            <Input 
              id="duration-input"
              type="number"
              value={mockDuration}
              onChange={(e) => setMockDuration(Number(e.target.value))}
              min={5}
              disabled={mockEnabled}
            />
          </div>
          
          {timeLeft !== null && (
            <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-md">
              Token will expire in: <strong>{timeLeft}</strong> seconds
            </div>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground">
          Note: The mock expiration setting applies to all components using the withAuth HOC.
        </p>
      </div>
      
      <div className="flex gap-4">
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}

// Wrap the component with withAuth to protect it
export default withAuth(AuthTestPage);