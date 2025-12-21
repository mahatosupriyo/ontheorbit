/**
 * AWS Avatar Utilities
 * ------------------------------------------------------------------
 * Centralized utilities for:
 * - Initializing the AWS S3 client
 * - Generating signed CloudFront URLs for avatar images
 *
 * Purpose:
 * - Securely serve private avatar images via CloudFront
 * - Abstract away S3 vs external image handling
 * - Provide a safe fallback when signing fails
 */

import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

/**
 * ------------------------------------------------------------------
 * 1. S3 Client Initialization
 * ------------------------------------------------------------------
 *
 * Used for uploading and deleting avatar objects.
 * Credentials and region are sourced from environment variables.
 *
 * NOTE:
 * - This client should only be used on the server
 * - Ensure environment variables are never exposed to the client
 */
export const s3 = new S3Client({
    region: process.env.ORBIT_AWS_REGION!,
    credentials: {
        accessKeyId: process.env.ORBIT_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.ORBIT_AWS_SECRET_ACCESS_KEY!,
    },
});

/**
 * ------------------------------------------------------------------
 * 2. Avatar URL Resolver / CloudFront Signer
 * ------------------------------------------------------------------
 *
 * Resolves a usable avatar URL based on the stored image reference.
 *
 * Behavior:
 * - Returns a placeholder when no image exists
 * - Returns external URLs (Google, OAuth providers) as-is
 * - Generates a signed CloudFront URL for private S3-hosted avatars
 *
 * @param imagePath - Stored avatar reference (S3 key or external URL)
 * @returns A publicly accessible avatar URL
 */
export function getAvatarUrl(imagePath: string | null) {
    /**
     * Fallback when no avatar is set.
     * This avoids broken images in the UI.
     */
    if (!imagePath) return "/placeholder.png";

    /**
     * If the image is already an external URL
     * (e.g. Google OAuth avatar), return it directly.
     */
    if (imagePath.startsWith("http") || imagePath.startsWith("https")) {
        return imagePath;
    }

    /**
     * Otherwise, treat the value as an S3 object key
     * and generate a signed CloudFront URL.
     *
     * Signed URLs:
     * - Keep avatars private at rest
     * - Allow time-limited public access via CDN
     */
    try {
        const url = getSignedUrl({
            url: `${process.env.ORBIT_CLOUDFRONT_URL}/${imagePath}`,
            keyPairId: process.env.ORBIT_CLOUDFRONT_KEY_PAIR_ID!,
            privateKey: process.env.ORBIT_CLOUDFRONT_PRIVATE_KEY!,
            // URL validity: 24 hours
            dateLessThan: new Date(
                Date.now() + 1000 * 60 * 60 * 24
            ).toString(),
        });

        return url;
    } catch (error) {
        /**
         * Fail-safe:
         * If signing fails for any reason, log the error
         * and return a placeholder to avoid breaking the UI.
         */
        console.error("Error signing CloudFront URL:", error);
        return "/placeholder.png";
    }
}
