"use client"
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './navbar.module.scss';
import Icon from '@/components/atoms/icons';

export default function NavBar() {

    return (
        <motion.nav className={styles.navwraper} >
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