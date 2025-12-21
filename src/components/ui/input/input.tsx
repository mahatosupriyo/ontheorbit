"use client";

/**
 * Input
 * ------------------------------------------------------------------
 * Reusable, styled input component used across forms.
 *
 * Responsibilities:
 * - Renders a labeled input field with optional helper text
 * - Supports error states and full-width layout
 * - Forwards refs for accessibility and form integrations
 *
 * Design notes:
 * - Styling is fully controlled via CSS modules
 * - The label wraps the input to improve click accessibility
 * - Validation state is controlled externally via props
 */

import React from "react";
import styles from "@/components/ui/input/input.module.scss";

/**
 * Props for the Input component.
 *
 * Extends all native <input> attributes so it behaves
 * exactly like a standard HTML input element.
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Optional label displayed above the input */
    label?: string;

    /** Optional helper text displayed below the input */
    helperText?: string;

    /** Visual variant for styling (default or error) */
    variant?: "default" | "error";

    /** Forces the input container to span full width */
    fullWidth?: boolean;

    /** Explicit error flag used to trigger error styles */
    error?: boolean;
}

/**
 * ForwardRef is used so parent components (forms, focus handlers,
 * accessibility tools) can directly access the native input element.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            helperText,
            variant = "default",
            fullWidth,
            className,
            error,
            ...props
        },
        ref
    ) => {
        return (
            /**
             * Outer container:
             * - Provides vertical spacing
             * - Keeps label, input, and helper text grouped
             */
            <div className={styles.container}>
                {/**
                 * Wrapper:
                 * - Controls visual shell (border, background, focus styles)
                 * - Applies width and error modifiers conditionally
                 */}
                <div
                    className={`
                        ${styles.wrapper}
                        ${fullWidth ? styles.fullWidth : ""}
                        ${error ? styles.error : ""}
                        ${className || ""}
                    `}
                >
                    {/**
                     * Label wrapper:
                     * - Clicking the label focuses the input
                     * - Improves accessibility and usability
                     */}
                    {label && (
                        <label className={styles.label}>
                            {label}

                            {/**
                             * Native input element:
                             * - Receives forwarded ref
                             * - All standard input props are passed through
                             * - Styling is controlled via CSS modules
                             */}
                            <input
                                ref={ref}
                                className={`${styles.input} ${styles[variant]}`}
                                {...props}
                            />
                        </label>
                    )}
                </div>

                {/**
                 * Helper text:
                 * - Optional descriptive or validation text
                 * - Variant styling aligns with input state
                 */}
                {helperText && (
                    <span className={`${styles.helper} ${styles[variant]}`}>
                        {helperText}
                    </span>
                )}
            </div>
        );
    }
);

/**
 * Display name improves debugging experience
 * when inspecting components in React DevTools.
 */
Input.displayName = "Input";
