'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '@/app/home.module.scss'

const transition = {
  duration: 0.2,
  ease: [0.785, 0.135, 0.15, 0.86],
};

const variants = {
  initial: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20, transition },
};

export default function AnimatedLink({ children, href }: { children: React.ReactNode; href: string }) {
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => {
      router.push(href);
    }, transition.duration * 500);
  };

  return (
    <AnimatePresence mode="wait">
      {!isExiting && (
        <motion.div
          key="main"
          initial="initial"
          exit="exit"
          variants={variants}
          className={styles.pagebtn}
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
