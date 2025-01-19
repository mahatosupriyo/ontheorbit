import React from 'react';
import styles from './loader.module.scss';

interface LoaderProps {
  variant?: 'light' | 'dark';
  size?: 'small' | 'medium' | 'large';
}

const Loader: React.FC<LoaderProps> = ({ variant = 'dark', size = 'medium' }) => {
  const loaderClass = `${styles.loader} ${styles[variant]} ${styles[size]}`;

  return <div className={loaderClass}></div>;
};

export default Loader;
