/**
 * NextAuth Type Augmentation
 * ------------------------------------------------------------------
 * Extends NextAuth's default TypeScript definitions to include
 * application-specific user fields.
 *
 * Purpose:
 * - Provide strong typing for custom session properties
 * - Ensure role- and username-based logic is type-safe across the app
 *
 * This file should be included in the TypeScript compilation scope
 * (e.g. via `tsconfig.json` → `include`).
 */

import { type DefaultSession } from "next-auth";
import { type UserRole } from "@/server/db/schema/auth";

/**
 * Module augmentation for `next-auth`.
 * This allows us to safely extend built-in interfaces.
 */
declare module "next-auth" {
    /**
     * Augmented Session interface.
     *
     * Adds application-specific fields to `session.user`
     * while preserving all default NextAuth user properties
     * (name, email, image, etc.).
     */
    interface Session {
        user: {
            /** Unique user identifier from the database */
            id: string;

            /** Role used for authorization and access control */
            role: UserRole;

            /** Public username used for profile URLs and display */
            username: string;
        } & DefaultSession["user"];
    }

    /**
     * Augmented User interface.
     *
     * Represents the persisted user entity returned by adapters.
     * This ensures role information is available at the type level
     * when working with user objects server-side.
     */
    interface User {
        role: UserRole;
    }
}
