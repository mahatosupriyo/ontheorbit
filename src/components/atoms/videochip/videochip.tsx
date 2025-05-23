"use client";
import Link from 'next/link';
import styles from './videochip.module.scss';
import { motion } from 'framer-motion';

export default function VideoChip() {
    return (
        <div className={styles.videochipwraper}>
            <Link href="/" className={styles.videolink}>
                <img
                    src="https://i.pinimg.com/originals/d9/11/1b/d9111be911dd2f932a5242cf958d336e.gif"
                    draggable="false"
                    className={styles.videobanner} />
            </Link>
            <h3 className={styles.videotitle}>Episode : 2 | Visual Technique Library</h3>
        </div>
    )
}