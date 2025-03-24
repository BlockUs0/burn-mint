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
    // Apply mock setting with current duration
    console.log(`Setting mock expiration to ${mockEnabled ? 'enabled' : 'disabled'}, duration: ${mockDuration * 1000}ms`);
    setMockExpiration(mockEnabled, mockDuration * 1000);
    
    if (mockEnabled) {
      // Initialize the countdown timer
      setTimeLeft(mockDuration);
      
      // Create a more reliable countdown timer
      const startTime = Date.now();
      const expirationTime = startTime + (mockDuration * 1000); 
      
      const timer = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((expirationTime - now) / 1000));
        
        console.log(`Countdown: ${remaining} seconds remaining until token expiration`);
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          console.log("===== TIMER EXPIRED! =====");
          console.log("===== FORCING TOKEN CHECK =====");
          
          // First, log current localStorage state
          const token = localStorage.getItem("blockus_access_token");
          console.log("Current token exists:", !!token);
          
          // When timer reaches zero, ensure token is actually checked immediately
          try {
            // Create and dispatch a custom event to trigger the recheck
            const forceRecheckEvent = new CustomEvent('force-token-check');
            window.dispatchEvent(forceRecheckEvent);
            
            // Also dispatch as regular Event for maximum compatibility
            window.dispatchEvent(new Event('force-token-check'));
            
            console.log("Force token check events dispatched successfully");
          } catch (err) {
            console.error("Error dispatching force check event:", err);
          }
          
          // Clear the timer once we're done
          clearInterval(timer);
        }
      }, 500); // Check twice per second for more accuracy
      
      // Clean up timer on unmount or when settings change
      return () => {
        console.log("Cleaning up timer");
        clearInterval(timer);
      };
    } else {
      // Reset when disabled
      setTimeLeft(null);
    }
  }, [mockEnabled, mockDuration]);
  
  // Function to decode and update token info
  const updateTokenInfo = () => {
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
        setTokenInfo(null);
      }
    } else {
      setTokenInfo(null);
    }
  };

  // Run token info update on component mount
  useEffect(() => {
    updateTokenInfo();
    
    // Also update when token changes or expires
    const intervalId = setInterval(updateTokenInfo, 2000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Authentication Test Page</h1>
      
      <div className="bg-card p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Token Information</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={updateTokenInfo}
          >
            Refresh Token Info
          </Button>
        </div>
        
        {tokenInfo ? (
          <div className="space-y-2">
            <p><strong>Subject:</strong> {tokenInfo.sub}</p>
            {tokenInfo.exp && (
              <p>
                <strong>Expires:</strong> {new Date(tokenInfo.exp * 1000).toLocaleString()}
                {" - "}
                <span className={
                  Date.now() > tokenInfo.exp * 1000 
                    ? "text-red-500 font-bold" 
                    : "text-green-500"
                }>
                  {Date.now() > tokenInfo.exp * 1000 ? "EXPIRED" : "VALID"}
                </span>
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
            <div className={`px-4 py-2 rounded-md ${
              timeLeft > 5 
                ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200" 
                : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
            }`}>
              Token will expire in: <strong>{timeLeft}</strong> seconds
              {timeLeft === 0 && (
                <div className="mt-2 font-bold">
                  Session expired! You should be redirected to home page and see a toast notification.
                </div>
              )}
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