import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

// Initialize the Auth0 client
export const auth0 = new Auth0Client({
  // Options are loaded from environment variables by default
  // Ensure necessary environment variables are properly set
  // domain: process.env.AUTH0_DOMAIN,
  // clientId: process.env.AUTH0_CLIENT_ID,
  // clientSecret: process.env.AUTH0_CLIENT_SECRET,
  // appBaseUrl: process.env.APP_BASE_URL,
  // secret: process.env.AUTH0_SECRET,

  async onCallback(error, context, session) {
    console.log("🔥 Auth0 onCallback triggered!");
    console.log("Error:", error);
    console.log("Context:", context);
    console.log("Session:", session);

    if (error) {
      console.error("❌ Auth0 callback error:", error);
      return NextResponse.redirect(new URL("/"));
    }

    if (!session || !session.user) {
      console.error("❌ No session or user found");
      console.log("Session exists:", !!session);
      console.log("User exists:", !!(session && session.user));
      return NextResponse.redirect(new URL("/"));
    }

    console.log("✅ Session and user found:");
    console.log("User data:", JSON.stringify(session.user, null, 2));

    try {
      const apiUrl = `${process.env.APP_BASE_URL || "http://localhost:3000"}/api/sync-user`;
      console.log("🌐 Making API call to:", apiUrl);
      
      // Make network call to sync user with database
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: session.user }),
      });

      console.log("📡 API Response status:", response.status);
      console.log("📡 API Response statusText:", response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Failed to sync user:", response.statusText);
        console.error("❌ Response body:", errorText);
      } else {
        const result = await response.json();
        console.log("✅ User sync successful:", result.action, session.user.email);
        console.log("📊 Full result:", JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error("❌ Error syncing user:", error);
      console.error("❌ Error stack:", error.stack);
    }

    console.log("🔄 Redirecting to:", process.env.APP_BASE_URL || "/dances");
    // Continue with normal auth flow
    return NextResponse.redirect(new URL(process.env.APP_BASE_URL || "/dances"));
  },

  authorizationParameters: {
    // In v4, the AUTH0_SCOPE and AUTH0_AUDIENCE environment variables for API authorized applications are no longer automatically picked up by the SDK.
    // Instead, we need to provide the values explicitly.
    scope: process.env.AUTH0_SCOPE,
    audience: process.env.AUTH0_AUDIENCE,
  },
});
