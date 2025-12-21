"use client";

/**
 * Button
 * ------------------------------------------------------------------
 * Reusable button component for triggering user actions.
 *
 * Responsibilities:
 * - Wraps a native <button> element with consistent styling
 * - Supports visual variants and sizes via CSS modules
 * - Forwards all native button attributes for full compatibility
 *
 * Design notes:
 * - Styling and interaction states are handled entirely in CSS
 * - This component is intentionally minimal and composable
 */

import React from "react";
import styles from "@/components/ui/button/button.module.scss";

/**
 * Props for the Button component.
 *
 * Extends native button attributes so it behaves exactly
 * like a standard HTML button.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Visual style of the button */
    variant?: "primary" | "secondary" | "danger";

    /** Size modifier controlling padding and font size */
    size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    size = "md",
    className,
    ...props
}) => {
    return (
        /**
         * Native button element:
         * - Combines base styles with variant and size modifiers
         * - Accepts all standard button props (type, disabled, onClick, etc.)
         */
        <button
            className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className || ""}`}
            {...props}
        >
            {/**
             * Button content:
             * - Can be text, icons, or any ReactNode
             */}
            {children}
        </button>
    );
};
