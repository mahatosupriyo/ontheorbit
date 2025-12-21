/**
 * Redis & Rate Limiting Utilities
 * ------------------------------------------------------------------
 * Centralized setup for:
 * - Redis client (Upstash)
 * - Application-level rate limiting
 *
 * Purpose:
 * - Protect sensitive actions from abuse (e.g. profile updates, uploads)
 * - Provide a reusable Redis instance across the server
 *
 * Notes:
 * - This file is intended for server-side usage only
 * - Environment variables must never be exposed to the client
 */

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

/**
 * ------------------------------------------------------------------
 * 1. Redis Client Initialization
 * ------------------------------------------------------------------
 *
 * Used as the backing store for rate limiting and other
 * lightweight server-side state.
 */
export const redis = new Redis({
    url: process.env.REDIS_URL!,
    token: process.env.REDIS_TOKEN!,
});

/**
 * ------------------------------------------------------------------
 * 2. Rate Limiter: Bio / Profile Actions
 * ------------------------------------------------------------------
 *
 * Configuration:
 * - Sliding window rate limit
 * - Maximum 10 requests per 1 hour per identifier
 *
 * Typical usage:
 * - Avatar uploads
 * - Bio/profile updates
 * - Other user-editable personal data
 *
 * Analytics:
 * - Enabled to allow monitoring and tuning of limits
 */
export const bioRateLimiter = new Ratelimit({
    redis,

    // Sliding window: allows smoother distribution than fixed windows
    limiter: Ratelimit.slidingWindow(10, "1 h"),

    // Enable Upstash analytics for observability
    analytics: true,

    // Prefix isolates this limiter from others in the same Redis instance
    prefix: "@upstash/ratelimit/bio",
});
