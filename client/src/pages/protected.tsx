import React from "react";
import withAuth from "@/lib/withAuth";

function ProtectedPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Protected Page</h1>
      <p className="mb-4">
        This page is protected and only accessible to authenticated users with a valid token.
      </p>
      <p>
        The withAuth HOC checks your token expiration every second and will automatically
        log you out and redirect to the home page when your session expires.
      </p>
    </div>
  );
}

// Wrap the component with the withAuth HOC to make it protected
export default withAuth(ProtectedPage);