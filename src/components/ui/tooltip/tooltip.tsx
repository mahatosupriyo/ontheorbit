import React from 'react';
import styles from './tooltip.module.scss';

type Direction = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: string;
  direction?: Direction;
  children: React.ReactNode;
  className?: string; // Optional: to style the wrapper
}

const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  direction = 'top', 
  children,
  className = ''
}) => {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      {children}
      <span className={`${styles.tooltip} ${styles[direction]}`}>
        {content}
      </span>
    </div>
  );
};

export default Tooltip;