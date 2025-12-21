"use client";

/**
 * TextArea
 * ------------------------------------------------------------------
 * Reusable multiline text input component.
 *
 * Responsibilities:
 * - Renders a labeled <textarea> with consistent styling
 * - Reuses Input styles to maintain design parity
 * - Supports helper text and full-width layouts
 * - Forwards refs for focus management and form libraries
 *
 * Design notes:
 * - Native <textarea> semantics are preserved
 * - Styling is shared with Input for consistency
 * - Resize behavior is intentionally constrained via inline styles
 */

import React from "react";
import styles from "@/components/ui/input/input.module.scss";

/**
 * Props definition for the TextArea component.
 *
 * Extends native textarea attributes so it behaves
 * exactly like a standard HTML <textarea>.
 */
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Optional label displayed above the textarea */
    label?: string;

    /** Optional helper text displayed below the textarea */
    helperText?: string;

    /** Forces the textarea container to span full width */
    fullWidth?: boolean;
}

/**
 * ForwardRef allows parent components to directly access
 * the underlying <textarea> element.
 */
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (
        {
            label,
            helperText,
            fullWidth,
            className,
            ...props
        },
        ref
    ) => {
        return (
            /**
             * Outer container:
             * - Groups label, textarea, and helper text
             * - Provides consistent vertical spacing
             */
            <div className={styles.container}>
                {/**
                 * Wrapper:
                 * - Provides visual shell (border, background, focus states)
                 * - Applies full-width layout when requested
                 */}
                <div
                    className={`${styles.wrapper} ${fullWidth ? styles.fullWidth : ""
                        } ${className || ""}`}
                >
                    {/**
                     * Label wrapper:
                     * - Clicking the label focuses the textarea
                     * - Improves accessibility and usability
                     */}
                    {label && (
                        <label className={styles.label}>
                            {label}

                            {/**
                             * Native textarea element:
                             * - Receives forwarded ref
                             * - Spellcheck disabled intentionally
                             * - Resize constrained for layout stability
                             */}
                            <textarea
                                ref={ref}
                                spellCheck={false}
                                className={styles.input}
                                style={{
                                    minHeight: "12rem",
                                    resize: "vertical",
                                    maxHeight: "30rem",
                                    fontFamily: "inherit",
                                }}
                                {...props}
                            />
                        </label>
                    )}
                </div>

                {/**
                 * Helper text:
                 * - Optional instructional or descriptive text
                 */}
                {helperText && (
                    <span className={styles.helper}>{helperText}</span>
                )}
            </div>
        );
    }
);

/**
 * Display name improves debugging and React DevTools readability.
 */
TextArea.displayName = "TextArea";
