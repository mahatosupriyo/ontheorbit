"use client"
import React, { useState, useEffect, useRef } from 'react';
import ColorThief from 'colorthief';
import chroma from 'chroma-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Upload } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import styles from './colors.module.scss';

// --- Types ---

interface ColumnProps {
  color: string;
  isActive: boolean;
  onClick: () => void;
  onCopy: (text: string) => void;
}

const App: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [dominantColor, setDominantColor] = useState<string>('#000000');
  const [activeColIndex, setActiveColIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Image Processing ---

  const processImage = (url: string) => {
    setImageSrc(url);
    setActiveColIndex(null);
  };

  const handleImageLoad = () => {
    const colorThief = new ColorThief();
    const img = imgRef.current;

    if (img && img.complete && img.naturalWidth > 0) {
      try {
        const dom = colorThief.getColor(img);
        const domHex = chroma(dom).hex();
        setDominantColor(domHex);

        const rawPalette = colorThief.getPalette(img, 5);
        const hexPalette = rawPalette.map((rgb) => chroma(rgb).hex());
        
        while(hexPalette.length < 5) {
          hexPalette.push(chroma.random().hex());
        }
        
        setColors(hexPalette);
      } catch (error) {
        console.error("Error extracting colors", error);
        toast.error("Could not extract colors.");
      }
    }
  };

  // --- Handlers ---

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
        processImage(URL.createObjectURL(file));
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) processImage(URL.createObjectURL(blob));
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // --- Styling ---

  const getBackgroundColor = (): string => {
    if (!imageSrc) return '#050505'; // Slightly darker default landing
    return chroma(dominantColor).set('hsl.l', 0.2).css();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${text}`);
  };

  return (
    <>
      <Toaster position="top-center" theme="dark" />
      
      <div 
        className={`${styles.container} ${isDragging ? styles.dragging : ''} ${imageSrc ? styles.hasImage : ''}`}
        style={{ backgroundColor: getBackgroundColor() }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Hidden Analysis Image */}
        <img 
          ref={imgRef} 
          src={imageSrc || undefined} 
          alt="analysis" 
          style={{ display: 'none' }} 
          onLoad={handleImageLoad}
          crossOrigin="anonymous"
        />

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          style={{ display: 'none' }} 
        />

        {/* Header - Always Visible */}
        <header className={styles.header}>
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <h1>Drag and Drop</h1>
            <div className={styles.controls}>
               <span className={styles.shortcut}>ctrl v</span>
               <button className={styles.uploadBtn} onClick={handleUploadClick}>
                 <Upload size={14} /> Upload Image
               </button>
            </div>
          </motion.div>
        </header>

        {/* Preview - Only renders when image exists */}
        <AnimatePresence>
          {imageSrc && (
            <motion.div 
              className={styles.imagePreview}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              <img src={imageSrc} alt="Preview" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Palette - Only renders when image exists */}
        {imageSrc && (
          <div className={styles.paletteContainer}>
            <AnimatePresence>
              {colors.map((color, index) => (
                <Column 
                  key={`${color}-${index}`}
                  color={color}
                  isActive={index === activeColIndex}
                  onClick={() => setActiveColIndex(index === activeColIndex ? null : index)}
                  onCopy={copyToClipboard}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );
};

const Column: React.FC<ColumnProps> = ({ color, isActive, onClick, onCopy }) => {
  const variations: string[] = isActive 
    ? chroma.scale(['#fff', color, '#000']).mode('lch').colors(10) 
    : [];

  let closestIndex = -1;
  let minDistance = Infinity;

  if (isActive) {
    variations.forEach((v, i) => {
      const dist = chroma.distance(v, color);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    });
  }

  return (
    <motion.div 
      className={styles.column}
      onClick={onClick}
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      layout
    >
      {isActive ? (
        <div className={styles.variationsList}>
           {variations.map((variant, idx) => {
             const isOriginal = idx === closestIndex;
             
             return (
               <div 
                 key={variant} 
                 className={styles.variationItem} 
                 style={{ backgroundColor: variant }}
                 onClick={(e: React.MouseEvent) => { 
                   e.stopPropagation(); 
                   onCopy(variant); 
                 }}
               >
                 {isOriginal && (
                    <span 
                      className={styles.activeDot} 
                      style={{ 
                        background: chroma(variant).luminance() > 0.5 ? 'black' : 'white'
                      }}
                    />
                 )}
                 <span className={styles.variationHex}>{variant}</span>
               </div>
             )
           })}
           
           <div 
             style={{ 
               position: 'absolute', 
               bottom: '15%', 
               left: '50%', 
               transform: 'translateX(-50%)', 
               pointerEvents: 'none',
               zIndex: 5
             }}
           >
              <span 
                className={styles.hexCode} 
                style={{ 
                  background: 'white', 
                  color: 'black', 
                  mixBlendMode: 'normal', 
                  padding: '5px 10px', 
                  fontSize: '0.8rem',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                {color}
              </span>
           </div>
        </div>
      ) : (
        <motion.div 
          style={{ 
            width: '100%', 
            height: '100%', 
            backgroundColor: color, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'flex-end', 
            alignItems: 'center' 
          }}
          whileHover={{ scaleY: 1.02 }}
        >
          <Copy size={20} className={styles.copyIcon} />
          <span 
             className={styles.hexCode}
             onClick={(e: React.MouseEvent) => { 
               e.stopPropagation(); 
               onCopy(color); 
             }}
          >
            {color}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default App;