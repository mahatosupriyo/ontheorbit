"use client";

/**
 * RadioGroup
 * ------------------------------------------------------------------
 * Custom radio button group component.
 *
 * Responsibilities:
 * - Renders a labeled group of radio options
 * - Manages selection via controlled `value`
 * - Emits the selected value through `onChange`
 * - Provides a fully custom visual radio UI while
 *   preserving native input semantics
 *
 * Design notes:
 * - Native <input type="radio"> elements are visually hidden
 * - Accessibility and form behavior rely on native inputs
 * - Visual state is driven by CSS module classes
 */

import React from "react";
import styles from "./radiogroup.module.scss";

/**
 * Props definition for RadioGroup.
 */
interface RadioGroupProps {
    /** Optional group label displayed above the options */
    label?: string;

    /** Shared name attribute for radio inputs (required for grouping) */
    name: string;

    /** List of selectable options */
    options: readonly string[];

    /** Currently selected value (controlled) */
    value?: string;

    /** Callback fired when selection changes */
    onChange: (value: string) => void;

    /** Optional error message displayed below the group */
    error?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
    label,
    name,
    options,
    value,
    onChange,
    error,
}) => {
    return (
        /**
         * Wrapper:
         * - Provides spacing and layout for the entire radio group
         */
        <div className={styles.wrapper}>
            {/**
             * Group label:
             * - Describes the radio group context
             * - Rendered only when provided
             */}
            {label && <label className={styles.groupLabel}>{label}</label>}

            {/**
             * Options container:
             * - Wraps all radio options
             * - Allows flexible layout via CSS (wrap, gap)
             */}
            <div className={styles.optionsContainer}>
                {options.map((option) => (
                    /**
                     * Option label:
                     * - Acts as the clickable area for the radio input
                     * - Applies selected styling when value matches
                     */
                    <label
                        key={option}
                        className={`${styles.option} ${value === option ? styles.selected : ""
                            }`}
                    >
                        {/**
                         * Native radio input:
                         * - Visually hidden but still accessible
                         * - Controls checked state and form behavior
                         */}
                        <input
                            type="radio"
                            name={name}
                            value={option}
                            checked={value === option}
                            onChange={(e) => onChange(e.target.value)}
                            className={styles.radioInput}
                        />

                        {/**
                         * Custom radio visual:
                         * - Replaces default browser radio appearance
                         * - Styling reflects checked/unchecked state
                         */}
                        <span className={styles.customRadio} />

                        {/**
                         * Option label text:
                         * - Displays the option value
                         */}
                        <span className={styles.optionLabel}>{option}</span>
                    </label>
                ))}
            </div>

            {/**
             * Error message:
             * - Displayed below the radio group when provided
             * - Intended for validation feedback
             */}
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
};
