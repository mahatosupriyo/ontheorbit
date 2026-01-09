/**
 * Profile Update API (PUT)
 * ------------------------------------------------------------------
 * Handles secure, rate-limited updates to a user's profile.
 *
 * Core responsibilities:
 * - Authenticate the request
 * - Validate and sanitize input using Zod
 * - Enforce business rules (cooldowns, uniqueness, age limits)
 * - Apply partial updates safely
 * - Protect high-frequency fields via Redis rate limiting
 *
 * Design principles:
 * - Server is the source of truth
 * - Validation is strict and explicit
 * - Database writes occur only when data actually changes
 */

import { auth } from "@/auth";
import { db } from "@/server/db";
import { users } from "@/server/db/schema/auth";
import { eq, ne, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { bioRateLimiter } from "@/server/utils/redis";
import { z } from "zod";
import { COUNTRY_CODES } from "@/server/lib/countries";
import { GENDERS } from "@/server/lib/genders";

// ============================================================================
// 1. ZOD SCHEMA (Strict Validation & Sanitization)
// ============================================================================

/**
 * Schema defining all allowed profile update fields.
 *
 * Key goals:
 * - Reject invalid data early
 * - Normalize values (trim, lowercase, auto-format URLs)
 * - Encode business rules directly into validation
 */
const profileUpdateSchema = z.object({
    /** Display name (limited changes, enforced later) */
    name: z.string().min(2).max(50).trim().optional(),

    /** Gender selection (enum-backed) */
    gender: z.enum(GENDERS).optional().or(z.literal("")),

    /**
     * Username rules:
     * - Alphabets only
     * - Auto-lowercased
     * - Uniqueness enforced later at DB level
     */
    username: z
        .string()
        .min(3)
        .max(20)
        .regex(/^[a-zA-Z]+$/, "Username can only contain alphabets (no numbers).")
        .trim()
        .optional()
        .transform((val) => val?.toLowerCase()),

    /**
     * About / bio field:
     * - Max 500 characters
     * - Max 50 words
     * - Normalized line breaks
     */
    about: z
        .string()
        .max(500, "About section is too long (max 500 chars).")
        .transform((val) => {
            const words = val.trim().split(/\s+/);
            if (words.length > 50) {
                throw new z.ZodError([{
                    code: "custom",
                    path: ["about"],
                    message: "About section cannot exceed 50 words."
                }]);
            }
            return val.trim().replace(/\n{3,}/g, "\n\n");
        })
        .optional(),

    /**
     * Portfolio URL:
     * - Auto-prepends https:// if missing
     * - Must be a valid URL (or empty)
     */
    portfolioUrl: z
        .string()
        .max(200)
        .trim()
        .transform((val) => {
            if (!val) return "";
            if (!/^https?:\/\//i.test(val)) {
                return `https://${val}`;
            }
            return val;
        })
        .pipe(
            z.string().url("Please enter a valid URL (e.g., domain.com)").or(z.literal(""))
        )
        .optional(),

    /** E.164-compatible phone number */
    phoneNumber: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format.")
        .optional()
        .or(z.literal("")),

    /** Country code (enum-backed) */
    country: z
        .enum(COUNTRY_CODES)
        .optional()
        .or(z.literal("")),

    /**
     * Date of birth:
     * - Requires all parts (day/month/year)
     * - Must be a valid calendar date
     * - Enforces minimum age (13+)
     */
    dob: z.object({
        day: z.string().optional(),
        month: z.string().optional(),
        year: z.string().optional(),
    }).optional().transform((val) => {
        if (!val?.day || !val?.month || !val?.year) return null;

        const day = parseInt(val.day);
        const month = parseInt(val.month);
        const year = parseInt(val.year);

        const date = new Date(Date.UTC(year, month, day));

        if (isNaN(date.getTime()) || date.getUTCMonth() !== month) {
            throw new z.ZodError([{
                code: "custom",
                path: ["dob"],
                message: "Invalid date provided."
            }]);
        }

        const today = new Date();
        let age = today.getFullYear() - year;
        if (today.getMonth() < month || (today.getMonth() === month && today.getDate() < day)) {
            age--;
        }

        if (age < 13) {
            throw new z.ZodError([{
                code: "custom",
                path: ["dob"],
                message: "You must be at least 13 years old."
            }]);
        }

        return date;
    }),
});

// ============================================================================
// Helper Utilities
// ============================================================================

/**
 * Calculates absolute day difference between two dates.
 * Used for enforcing cooldown periods.
 */
const getDaysDiff = (date1: Date | null, date2: Date) => {
    if (!date1) return 999;
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ============================================================================
// PUT Handler
// ============================================================================

export async function PUT(req: Request) {
    try {
        // ---------------------------------------------------------
        // 1. AUTHENTICATION
        // ---------------------------------------------------------
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        // ---------------------------------------------------------
        // 2. INPUT VALIDATION (Zod)
        // ---------------------------------------------------------
        const rawBody = await req.json();
        const parseResult = profileUpdateSchema.safeParse(rawBody);

        if (!parseResult.success) {
            return NextResponse.json(
                { error: parseResult.error.issues[0].message },
                { status: 400 }
            );
        }

        const { name, username, about, portfolioUrl, phoneNumber } = parseResult.data;

        // ---------------------------------------------------------
        // 3. FETCH CURRENT USER STATE
        // ---------------------------------------------------------
        const currentUser = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const updates: any = { updatedAt: new Date() };
        const now = new Date();

        // ---------------------------------------------------------
        // 4. NAME CHANGE COOLDOWN (30 DAYS)
        // ---------------------------------------------------------
        if (name && name !== currentUser.name) {
            if (currentUser.nameUpdatedAt) {
                const daysSinceUpdate = getDaysDiff(currentUser.nameUpdatedAt, now);
                if (daysSinceUpdate < 30) {
                    return NextResponse.json(
                        { error: `You can only change your name once every 30 days. Try again in ${30 - daysSinceUpdate} days.` },
                        { status: 429 }
                    );
                }
            }
            updates.name = name;
            updates.nameUpdatedAt = now;
        }

        // ---------------------------------------------------------
        // 5. USERNAME CHANGE COOLDOWN + UNIQUENESS (7 DAYS)
        // ---------------------------------------------------------
        if (username && username !== currentUser.username) {
            if (currentUser.username && !username) {
                return NextResponse.json({ error: "Username cannot be removed." }, { status: 400 });
            }

            if (currentUser.usernameUpdatedAt) {
                const daysSinceUpdate = getDaysDiff(currentUser.usernameUpdatedAt, now);
                if (daysSinceUpdate < 7) {
                    return NextResponse.json(
                        { error: `You can only change username once a week. Try again in ${7 - daysSinceUpdate} days.` },
                        { status: 429 }
                    );
                }
            }

            const taken = await db.query.users.findFirst({
                where: and(eq(users.username, username), ne(users.id, userId))
            });

            if (taken) {
                return NextResponse.json({ error: "This username is already taken." }, { status: 409 });
            }

            updates.username = username;
            updates.usernameChanged = true;
            updates.usernameUpdatedAt = now;
        }

        // ---------------------------------------------------------
        // 6. HIGH-FREQUENCY FIELDS (Redis Rate Limit)
        // ---------------------------------------------------------
        const isContentUpdating =
            (about !== undefined && about !== currentUser.about) ||
            (portfolioUrl !== undefined && portfolioUrl !== currentUser.portfolioUrl);

        if (isContentUpdating) {
            const { success, limit, remaining, reset } = await bioRateLimiter.limit(userId);

            if (!success) {
                return NextResponse.json(
                    { error: "You are updating your profile too often. Please wait a bit." },
                    {
                        status: 429,
                        headers: {
                            "X-RateLimit-Limit": limit.toString(),
                            "X-RateLimit-Remaining": remaining.toString(),
                            "X-RateLimit-Reset": reset.toString(),
                        }
                    }
                );
            }

            if (about !== undefined) updates.about = about;
            if (portfolioUrl !== undefined) updates.portfolioUrl = portfolioUrl;
        }

        // ---------------------------------------------------------
        // 7. APPLY REMAINING UPDATES
        // ---------------------------------------------------------
        if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
        if (parseResult.data.country !== undefined) updates.country = parseResult.data.country;
        if (parseResult.data.gender) updates.gender = parseResult.data.gender;
        if (parseResult.data.dob) updates.dateOfBirth = parseResult.data.dob;

        // Only perform DB write if something actually changed
        if (Object.keys(updates).length > 1) {
            await db.update(users).set(updates).where(eq(users.id, userId));
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Profile API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
