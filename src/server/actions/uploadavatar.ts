"use server";

/**
 * uploadAvatar
 * ------------------------------------------------------------------
 * Server action responsible for handling user avatar uploads.
 *
 * Responsibilities:
 * - Authenticate the user
 * - Enforce rate limiting for avatar uploads
 * - Validate and process the uploaded image
 * - Upload the processed avatar to S3
 * - Clean up the previously stored avatar (if applicable)
 * - Persist the new avatar reference in the database
 * - Revalidate affected application paths
 *
 * Security & performance notes:
 * - Runs on the server only (`"use server"`)
 * - Enforces file size and MIME-type validation
 * - Uses Sharp to normalize and compress images
 * - Applies aggressive caching for avatar assets
 */

import { auth } from "@/auth";
import { db } from "@/server/db";
import { users } from "@/server/db/schema/auth";
import { s3, getAvatarUrl } from "@/server/utils/awsavatarsigner";
import { bioRateLimiter } from "@/server/utils/redis";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

/**
 * S3 bucket name for avatar storage.
 * Assumed to be present in environment variables.
 */
const BUCKET = process.env.ORBIT_S3_BUCKET_NAME!;

/**
 * Maximum allowed upload size (in bytes).
 * Current limit: 5MB
 *
 * This is a hard guard before any image processing occurs.
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Handles avatar upload and replacement for the authenticated user.
 *
 * @param formData - Multipart form data containing the avatar file
 * @returns An object indicating success or failure, and avatar URL on success
 */
export async function uploadAvatar(formData: FormData) {
    try {
        /**
         * Authenticate the request and extract the user ID.
         * This ensures only logged-in users can upload avatars.
         */
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };
        const userId = session.user.id;

        /**
         * Rate limiting:
         * Prevents abuse by limiting how frequently a user can upload avatars.
         */
        const { success } = await bioRateLimiter.limit(`avatar_upload:${userId}`);
        if (!success) return { error: "Please wait before uploading again." };

        /**
         * Extract the uploaded file from FormData.
         */
        const file = formData.get("file") as File;
        if (!file) return { error: "No file found." };

        /**
         * File size validation.
         * Rejects large uploads early to protect memory and processing time.
         */
        if (file.size > MAX_FILE_SIZE) {
            return { error: "File too large (Max 5MB)." };
        }

        /**
         * MIME type validation.
         * Only image files are allowed.
         */
        if (!file.type.startsWith("image/")) {
            return { error: "Invalid image type." };
        }

        /**
         * Image processing:
         * - Convert file to buffer
         * - Resize to 300x300 (square avatar)
         * - Compress and convert to WebP for optimal size
         */
        const buffer = Buffer.from(await file.arrayBuffer());
        const processedImage = await sharp(buffer)
            .resize(300, 300, { fit: "cover" })
            .webp({ quality: 80 }) // Typically compresses to ~20–50KB
            .toBuffer();

        /**
         * Fetch the current user record to determine
         * whether an existing avatar needs cleanup.
         */
        const currentUser = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        /**
         * Cleanup old avatar:
         * - Only delete if the image is stored in S3 (not an external URL)
         * - Failures here are logged but do not block the upload
         */
        if (currentUser?.image && !currentUser.image.startsWith("http")) {
            try {
                await s3.send(
                    new DeleteObjectCommand({
                        Bucket: BUCKET,
                        Key: currentUser.image,
                    })
                );
            } catch (e) {
                console.error("Cleanup failed", e);
            }
        }

        /**
         * Generate a unique S3 object key.
         * Uses a random suffix to avoid collisions and caching issues.
         */
        const key = `avatars/${userId}/${crypto
            .randomBytes(8)
            .toString("hex")}.webp`;

        /**
         * Upload the processed avatar to S3.
         * - WebP content type
         * - Long-term cache control for CDN/browser caching
         */
        await s3.send(
            new PutObjectCommand({
                Bucket: BUCKET,
                Key: key,
                Body: processedImage,
                ContentType: "image/webp",
                CacheControl: "max-age=31536000",
            })
        );

        /**
         * Persist the new avatar key in the database.
         * `updatedAt` is also refreshed to reflect the change.
         */
        await db
            .update(users)
            .set({ image: key, updatedAt: new Date() })
            .where(eq(users.id, userId));

        /**
         * Revalidate cached pages that depend on user avatar data.
         */
        revalidatePath("/settings");
        revalidatePath("/");

        /**
         * Return the signed/public avatar URL for immediate client use.
         */
        return { success: true, url: getAvatarUrl(key) };

    } catch (err) {
        /**
         * Catch-all error handler.
         * Logs server-side error details and returns a generic message.
         */
        console.error(err);
        return { error: "Upload failed." };
    }
}
