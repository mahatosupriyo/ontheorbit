"use client";

/**
 * ColorExtractor App
 * ------------------
 * A production-ready React + TypeScript component that extracts a color palette
 * from an uploaded / pasted / dragged image using ColorThief and chroma-js.
 *
 * Changes made for production readiness:
 *  - Added documentation and typed props
 *  - Improved error handling and user feedback
 *  - Prevented object URL leaks (revokeObjectURL)
 *  - Memoized child component (Column) to avoid unnecessary renders
 *  - Defensive checks for client-only APIs (window, navigator)
 *  - Accessibility attributes for interactive elements
 *  - Constants and small helpers for clarity
 *
 * Note: This component intentionally keeps small child component(s) in the
 * same file to keep distribution simple. If you want to split into separate
 * files, move Column component to its own file and import.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ColorThief from 'colorthief';
import chroma from 'chroma-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Grid, X } from 'lucide-react';
import { toast } from 'sonner';
import styles from './colors.module.scss';
import Icon from '@/components/atoms/icons/icons';

// -----------------------------
// Constants & Configuration
// -----------------------------
const DEFAULT_DOMINANT = '#000000';
const PALETTE_SIZE = 5; // Number of palette colors to extract

// -----------------------------
// Utility: Determine readable text color for a background hex
// Returns either '#000000' or '#ffffff'
// -----------------------------
const getTextColor = (hex: string): string => {
  try {
    return chroma(hex).luminance() > 0.5 ? '#000000' : '#ffffff';
  } catch (e) {
    // If chroma fails (invalid color), fall back to white
    return '#ffffff';
  }
};

// -----------------------------
// Types
// -----------------------------
interface ColumnProps {
  color: string;
  isActive: boolean;
  onToggle: () => void;
  onCopy: (text: string) => void;
}

// -----------------------------
// Column (child): Displays a single color column and its variations
// Kept as memoized component to reduce re-renders when palette changes
// -----------------------------
const Column: React.FC<ColumnProps> = React.memo(({ color, isActive, onToggle, onCopy }) => {
  // When active, compute a small scale of variants for the selected color
  const variations: string[] = useMemo(() => {
    if (!isActive) return [];
    // Use LCH scale for perceptual spacing
    return chroma.scale(['#fff', color, '#000']).mode('lch').colors(10);
  }, [isActive, color]);

  // Identify which variant is closest to the original color
  const { closestIndex } = useMemo(() => {
    let closestIndexLocal = -1;
    let minDistance = Infinity;
    variations.forEach((v, i) => {
      const dist = chroma.distance(v, color);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndexLocal = i;
      }
    });
    return { closestIndex: closestIndexLocal };
  }, [variations, color]);

  const mainTextColor = getTextColor(color);

  return (
    <motion.div
      className={styles.column}
      onClick={() => !isActive && onCopy(color)}
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      layout
      role="button"
      tabIndex={0}
      aria-label={`Color column ${color}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!isActive) onCopy(color);
        }
      }}
    >
      {isActive ? (
        <div className={styles.variationsList}>
          <button
            className={styles.closeBtn}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            aria-label="Close shades view"
          >
            <Icon name='close' size={26} />
          </button>

          {variations.map((variant, idx) => {
            const isOriginal = idx === closestIndex;
            const varTextColor = getTextColor(variant);

            return (
              <div
                key={variant}
                className={styles.variationItem}
                style={{ backgroundColor: variant, color: varTextColor }}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onCopy(variant);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCopy(variant);
                  }
                }}
                aria-label={`Copy color ${variant}`}
              >
                {isOriginal && (
                  <span
                    className={styles.activeDot}
                    style={{
                      background: chroma(variant).luminance() > 0.5 ? 'black' : 'white',
                    }}
                  />
                )}
                <span className={styles.variationHex}>{variant}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className={styles.columnContent}
          style={{ backgroundColor: color, color: mainTextColor }}
        >
          <motion.button
            whileTap={{ opacity: 0.6, scale: 0.9 }}
            className={styles.utilButton}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            title="View Shades"
            aria-label={`View shades for ${color}`}
            style={{ color: 'currentColor' }}
          >
            <Icon name='variation' size={26} />
          </motion.button>

          <motion.div
            whileTap={{ opacity: 0.6 }}
            className={styles.hexCode}>
            {color}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
});
Column.displayName = 'Column';

// -----------------------------
// Main App component
// -----------------------------
const ColorApp: React.FC = () => {
  // Image & palette state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [dominantColor, setDominantColor] = useState<string>(DEFAULT_DOMINANT);
  const [activeColIndex, setActiveColIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Refs
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastObjectUrlRef = useRef<string | null>(null);

  // Clean up any generated object URLs to prevent memory leaks
  const setImageUrl = useCallback((url: string | null) => {
    // Revoke previous URL if it was an object URL
    if (lastObjectUrlRef.current && lastObjectUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(lastObjectUrlRef.current);
    }
    lastObjectUrlRef.current = url;
    setImageSrc(url);
    setActiveColIndex(null);
  }, []);

  // Process an image given a local object URL or remote URL
  const processImage = useCallback((url: string) => {
    setImageUrl(url);
  }, [setImageUrl]);

  // Handle image load event: extract dominant color + palette
  const handleImageLoad = useCallback(() => {
    // Note: color-thief must run in browser environment and requires the image to be fully loaded
    try {
      const colorThief = new ColorThief();
      const img = imgRef.current;

      if (img && img.complete && img.naturalWidth > 0) {
        const dom = colorThief.getColor(img);
        const domHex = chroma(dom).hex();
        setDominantColor(domHex);

        const rawPalette = colorThief.getPalette(img, PALETTE_SIZE);
        const hexPalette = rawPalette.map((rgb: number[]) => chroma(rgb as [number, number, number]).hex());

        // Ensure we always return PALETTE_SIZE colors
        while (hexPalette.length < PALETTE_SIZE) {
          hexPalette.push(chroma.random().hex());
        }

        setColors(hexPalette);
      }
    } catch (error) {
      console.error('Error extracting colors', error);
      // Provide user feedback; extraction failed
      toast.error('Could not extract colors from the image.');
    }
  }, []);

  // Drag handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(file);
        processImage(objectUrl);
      } else {
        toast.error('Dropped file is not an image.');
      }
    }
  };

  // File upload dialog trigger
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      processImage(objectUrl);
    }
    // Reset input value so the same file can be selected again if desired
    if (e.target) e.target.value = '';
  };

  // Handle paste (keyboard) events to accept pasted images from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const objectUrl = URL.createObjectURL(blob);
            processImage(objectUrl);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processImage]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (lastObjectUrlRef.current && lastObjectUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(lastObjectUrlRef.current);
      }
    };
  }, []);

  // Compute container background based on dominant color
  const getBackgroundColor = useCallback((): string => {
    if (!imageSrc) return '#050505';
    // Lower the lightness for a subtle background
    return chroma(dominantColor).set('hsl.l', 0.2).css();
  }, [imageSrc, dominantColor]);

  // Copy-to-clipboard with graceful fallback and user feedback
  const copyToClipboard = useCallback(async (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        toast.success(`Copied ${text}`);
      } catch (err) {
        console.error('Clipboard write failed', err);
        toast.error('Failed to copy to clipboard.');
      }
    } else {
      // Fallback: create temporary input
      try {
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        toast.success(`Copied ${text}`);
      } catch (err) {
        console.error('Clipboard fallback failed', err);
        toast.error('Failed to copy to clipboard.');
      }
    }
  }, []);

  return (
    <div className={styles.wraper}>
      <div
        className={`${styles.container} ${isDragging ? styles.dragging : ''} ${imageSrc ? styles.hasImage : ''}`}
        style={{ backgroundColor: getBackgroundColor() }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="region"
        aria-label="Image color extractor"
      >
        {/* Hidden image used only for ColorThief analysis */}
        <img
          draggable="false"

          ref={imgRef}
          src={imageSrc || undefined}
          alt="analysis"
          style={{ display: 'none', userSelect: 'none', pointerEvents: 'none' }}
          onLoad={handleImageLoad}
          crossOrigin="anonymous"
        />

        {/* Hidden file input used by upload button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
          aria-hidden
        />

        <header className={styles.header}>
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <Icon name='image' size={26} fill='#fff' />
            <h1>Drag and Drop</h1>
          </motion.div>
          <button className={styles.uploadBtn} onClick={handleUploadClick} aria-label="Upload image">
            Upload Image
          </button>
        </header>

        {/* Show preview image when present */}
        <AnimatePresence>
          {imageSrc && (
            <motion.div
              className={styles.imagePreview}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              <img draggable="false" style={{ userSelect: 'none', pointerEvents: 'none' }} src={imageSrc} alt="Preview" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Palette columns (populated after analysis) */}
        {imageSrc && (
          <div className={styles.paletteContainer}>
            <AnimatePresence>
              {colors.map((color, index) => (
                <Column
                  key={`${color}-${index}`}
                  color={color}
                  isActive={index === activeColIndex}
                  onToggle={() => setActiveColIndex(index === activeColIndex ? null : index)}
                  onCopy={copyToClipboard}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorApp;