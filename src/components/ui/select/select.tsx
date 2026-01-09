"use client";

/**
 * Select
 * ------------------------------------------------------------------
 * Reusable select (dropdown) component built on top of native <select>.
 *
 * Responsibilities:
 * - Renders a labeled select input with consistent styling
 * - Reuses Input component styles for visual consistency
 * - Supports helper text and full-width layouts
 * - Forwards refs for form integrations and accessibility
 *
 * Design notes:
 * - Native <select> is preserved for accessibility and keyboard support
 * - Styling is shared with Input to ensure a unified form design system
 */

import React from "react";
import styles from "../input/input.module.scss"; // Reuse Input styles for consistency

/**
 * Props definition for the Select component.
 *
 * Extends native select attributes so it behaves exactly
 * like a standard HTML <select> element.
 */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    /** Optional label displayed above the select */
    label?: string;

    /** Optional helper text displayed below the select */
    helperText?: string;

    /** Forces the select container to span full width */
    fullWidth?: boolean;

    /** Options map (e.g. COUNTRIES, MONTHS) where key = value, value = label */
    options: { [key: string]: string };

    /** Optional placeholder option shown at the top */
    placeholder?: string;
}

/**
 * ForwardRef allows parent components to directly access
 * the underlying <select> element (focus, form libraries, etc.).
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            label,
            helperText,
            fullWidth,
            className,
            options,
            placeholder,
            ...props
        },
        ref
    ) => {
        return (
            /**
             * Outer wrapper:
             * - Provides consistent vertical layout
             * - Matches the visual height of Input components
             */
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "7.7rem",
                }}
                className={`${styles.wrapper} ${fullWidth ? styles.fullWidth : ""
                    } ${className || ""}`}
            >
                {/**
                 * Label wrapper:
                 * - Clicking the label focuses the select
                 * - Maintains accessibility parity with Input
                 */}
                {label && (
                    <label className={styles.label}>
                        {label}

                        {/**
                         * Select wrapper:
                         * - Allows custom styling around native <select>
                         */}
                        <div className={styles.selectWrapper}>
                            {/**
                             * Native select element:
                             * - Receives forwarded ref
                             * - All standard select props are passed through
                             */}
                            <select
                                ref={ref}
                                className={styles.input}
                                {...props}
                                style={{ cursor: "pointer", appearance: 'none', margin: '0rem 0rem 0rem 0.1rem' }}
                            >
                                {/**
                                 * Optional placeholder option
                                 * Rendered only when provided
                                 */}
                                {placeholder && (
                                    <option value="">{placeholder}</option>
                                )}

                                {/**
                                 * Render select options from key/value map
                                 */}
                                {Object.entries(options).map(
                                    ([code, name]) => (
                                        <option
                                            style={{ cursor: "pointer" }}
                                            key={code}
                                            value={code}
                                        >
                                            {name}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                    </label>
                )}

                {/**
                 * Helper text:
                 * - Optional descriptive or instructional text
                 */}
                {helperText && (
                    <span className={styles.helper}>{helperText}</span>
                )}
            </div>
        );
    }
);

/**
 * Display name improves debugging and DevTools readability.
 */
Select.displayName = "Select";
