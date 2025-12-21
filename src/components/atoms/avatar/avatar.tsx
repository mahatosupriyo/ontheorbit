"use client";

import React, { useEffect } from 'react';
import { useAvatarStore } from '@/server/store/avatar/avatarstore';

interface AvatarImageProps {
    initialUrl?: string | null; // Pass server-side URL if available (for SEO/Speed)
    size?: number;
    className?: string;
}

export default function AvatarImage({ initialUrl, size = 40, className }: AvatarImageProps) {
    const avatarUrl = useAvatarStore((state) => state.avatarUrl);
    const setAvatarUrl = useAvatarStore((state) => state.setAvatarUrl);

    // Sync server-side initial URL with Zustand on mount
    useEffect(() => {
        if (initialUrl && !avatarUrl) {
            setAvatarUrl(initialUrl);
        }
    }, [initialUrl, avatarUrl, setAvatarUrl]);

    const displayUrl = avatarUrl || initialUrl || "https://ontheorbit.com/placeholder.png";

    return (
        <img
            src={displayUrl}
            alt="Avatar"
            className={className}
            style={{
                height: '4rem',
                width: '4rem',
                borderRadius: "50%",
                objectFit: "cover",
                aspectRatio: "1/1",
            }}
            onError={() => setAvatarUrl("https://ontheorbit.com/placeholder.png")}
        />
    );
}