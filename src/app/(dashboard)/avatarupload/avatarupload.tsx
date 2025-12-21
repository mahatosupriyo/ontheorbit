"use client";

/**
 * AvatarUpload
 * ------------------------------------------------------------------
 * Client-side avatar upload component.
 *
 * Responsibilities:
 * - Display the current user avatar
 * - Allow users to upload a new avatar image
 * - Perform client-side validation before upload
 * - Trigger server-side upload action
 * - Update UI instantly via global state (Zustand)
 *
 * Design notes:
 * - Uses a hidden file input triggered by clicking the avatar
 * - Optimistic UI update via avatar store
 * - Upload feedback provided through toast notifications
 */

import { useAvatarStore } from "@/server/store/avatar/avatarstore";
import { uploadAvatar } from "@/server/actions/uploadavatar";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AvatarUpload({
    initialUrl,
}: {
    initialUrl?: string | null;
}) {
    /** Reference to the hidden file input element */
    const fileInputRef = useRef<HTMLInputElement>(null);

    /** Local loading state to prevent duplicate uploads */
    const [isUploading, setIsUploading] = useState(false);

    /**
     * Zustand store:
     * - avatarUrl: globally shared avatar URL
     * - setAvatarUrl: updates avatar instantly across the app
     */
    const { avatarUrl, setAvatarUrl } = useAvatarStore();

    /**
     * Sync initial server-provided avatar URL with the store.
     * Ensures the avatar is available immediately after hydration.
     */
    useEffect(() => {
        if (initialUrl && !avatarUrl) {
            setAvatarUrl(initialUrl);
        }
    }, [initialUrl, avatarUrl, setAvatarUrl]);

    /**
     * Handles file selection and upload flow.
     *
     * Steps:
     * 1. Validate file presence and size
     * 2. Show loading toast
     * 3. Call server action to upload avatar
     * 4. Update avatar store on success
     * 5. Handle errors gracefully
     */
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        /**
         * Client-side file size validation.
         * Prevents unnecessary network and server processing.
         */
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File is too large. Max 5MB allowed.");

            // Reset input so the same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        setIsUploading(true);

        /** Show persistent loading toast */
        const toastId = toast.loading("Uploading avatar");

        const formData = new FormData();
        formData.append("file", file);

        try {
            /**
             * Call server action to upload avatar.
             * Server handles validation, processing, and storage.
             */
            const res = await uploadAvatar(formData);

            if (res.error) {
                // Server-side error
                toast.error(res.error, { id: toastId });
            } else if (res.url) {
                /**
                 * Success:
                 * - Update global avatar state for instant UI refresh
                 * - Replace loading toast with success message
                 */
                setAvatarUrl(res.url);
                toast.success("Avatar updated successfully", { id: toastId });
            }
        } catch (err) {
            // Unexpected client-side or network error
            console.error(err);
            toast.error("Something went wrong. Please try again.", {
                id: toastId,
            });
        } finally {
            setIsUploading(false);

            // Reset input to allow re-upload of the same file
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    /**
     * Determine which avatar URL to display.
     * Priority:
     * 1. Zustand store (latest upload)
     * 2. Initial server-provided URL
     * 3. Fallback placeholder
     */
    const displayUrl =
        avatarUrl || initialUrl || "https://ontheorbit.com/placeholder.png";

    return (
        /**
         * Avatar container:
         * - Clickable to trigger file selection
         * - Circular crop using border-radius
         */
        <motion.div
            whileHover={{ scale: 0.98 }}
            whileTap={{scale: 1}}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            style={{
                maxWidth: "20rem",
                aspectRatio: "1/1",
                position: "relative",
                cursor: isUploading ? "wait" : "pointer",
                borderRadius: "50rem",
                overflow: "hidden",
            }}
        >
            {/**
             * Avatar image:
             * - Pointer events disabled to allow parent click handling
             * - Non-draggable for better UX
             */}
            <motion.img
                src={displayUrl}
                alt="Avatar"
                draggable={false}
                style={{
                    objectFit: "cover",
                    userSelect: "none",
                    pointerEvents: "none",
                    height: "100%",
                    width: "100%",
                }}
            />

            {/**
             * Loading overlay:
             * - Visually blocks interaction during upload
             * - Indicates in-progress state
             */}
            {isUploading && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                    }}
                >
                    ...
                </div>
            )}

            {/**
             * Hidden file input:
             * - Triggered programmatically on container click
             * - Accepts common image formats
             */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                accept="image/png, image/jpeg, image/webp"
                style={{ display: "none" }}
            />
        </motion.div>
    );
}
