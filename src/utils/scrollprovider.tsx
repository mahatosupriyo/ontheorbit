"use client"

import type { ReactNode } from "react"
import { useLenis } from "@/utils/lenis"

interface SmoothScrollProviderProps {
    children: ReactNode
}

/**
 * SmoothScrollProvider Component
 * This component provides smooth scrolling functionality to its children using Lenis.
 * @param {SmoothScrollProviderProps} props - The props for the SmoothScrollProvider component.
 * @returns {JSX.Element} The SmoothScrollProvider component.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
    // Initialize Lenis smooth scrolling
    const lenis = useLenis()

    return <>{children}</>
}