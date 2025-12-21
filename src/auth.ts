/**
 * NextAuth Configuration
 * ------------------------------------------------------------------
 * Central authentication setup for the application.
 *
 * Responsibilities:
 * - Configure authentication providers (Google OAuth)
 * - Persist users and sessions via Drizzle ORM
 * - Enrich the session object with application-specific fields
 *
 * Notes:
 * - This configuration runs on the server only
 * - Database remains the source of truth for user metadata
 */

import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/server/db";
import Google from "next-auth/providers/google";
import { type Adapter } from "next-auth/adapters";
import { eq } from "drizzle-orm";
import { users } from "@/server/db/schema/auth";

/**
 * Exported helpers from NextAuth:
 * - handlers: route handlers for App Router
 * - signIn / signOut: server-side auth helpers
 * - auth: server-side session retrieval helper
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  /**
   * Adapter:
   * - Uses Drizzle ORM for persistence
   * - Handles users, sessions, accounts, and verification tokens
   */
  adapter: DrizzleAdapter(db) as Adapter,

  /**
   * Authentication providers.
   * Google OAuth is used as the primary identity provider.
   */
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],

  /**
   * Callbacks allow customization of NextAuth behavior.
   */
  callbacks: {
    /**
     * Session callback:
     * - Runs whenever a session is checked or created
     * - Used here to enrich the session with DB-backed fields
     */
    async session({ session, user }) {
      /**
       * Fetch the full user record from the database.
       * This ensures session data reflects the latest persisted state.
       */
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
      });

      /**
       * Return an augmented session object.
       * Additional fields are merged into `session.user`.
       */
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,                         // Always expose user ID
          role: dbUser?.role ?? "USER",        // Default role fallback
          username: dbUser?.username ?? "",    // Username for profile routing
        },
      };
    },
  },
});
