"use client"
import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';
import styles from './navbar.module.scss';
import Icon from '@/components/atoms/icons';

export default function NavBar() {
    const controls = useAnimation();
    const [scrollDirection, setScrollDirection] = useState('up');

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const updateScrollDirection = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY) {
                setScrollDirection('down');
            } else {
                setScrollDirection('up');
            }
            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', updateScrollDirection);

        return () => {
            window.removeEventListener('scroll', updateScrollDirection);
        };
    }, []);

    useEffect(() => {
        if (scrollDirection === 'down') {
            controls.start({ y: '-100%', transition: { duration: 0.4, ease: [0.785, 0.135, 0.15, 0.86] } });
        } else {
            controls.start({ y: '0%', transition: { duration: 0.4, ease: [0.785, 0.135, 0.15, 0.86] } });
        }
    }, [scrollDirection, controls]);

    return (
        <motion.nav className={styles.navwraper} animate={controls}>
            <div className={styles.nav}>
                <Link draggable="false" href="/" className={styles.primarybutton}>

                    <Icon name='oto' size={64}/>

                </Link>

                <div className={styles.linkslist}>
                    <Link className={styles.link} href="/">Garage</Link>
                    <Link className={styles.link} href="/">Voyager</Link>
                    <Link className={styles.link} href="/">Space</Link>
                </div>

                <div className={styles.rightwraper}>
                    <motion.button whileTap={{ opacity: 0.6 }} className={styles.btn}>LOG IN</motion.button>
                </div>
            </div>
        </motion.nav>
    );
}