/**
 * Avatar Store
 * ------------------------------------------------------------------
 * Global client-side state for managing the user's avatar URL.
 *
 * Purpose:
 * - Provides a single source of truth for the active avatar URL
 * - Allows instant UI updates after avatar upload or change
 * - Avoids prop-drilling avatar data across components
 *
 * Notes:
 * - This store is intentionally minimal
 * - Persistence is not enabled; avatar data is expected to be
 *   rehydrated from the server on refresh
 */

import { create } from "zustand";

/**
 * Shape of the avatar store state.
 */
interface AvatarState {
    /** Current avatar URL (signed or public), null when unset */
    avatarUrl: string | null;

    /** Updates the avatar URL in the store */
    setAvatarUrl: (url: string) => void;
}

/**
 * Zustand store for avatar-related state.
 *
 * Usage:
 * const { avatarUrl, setAvatarUrl } = useAvatarStore();
 */
export const useAvatarStore = create<AvatarState>((set) => ({
    avatarUrl: null,

    /**
     * Updates the avatar URL.
     * Typically called after a successful avatar upload.
     */
    setAvatarUrl: (url) => set({ avatarUrl: url }),
}));
