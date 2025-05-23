"use client";
import NavBar from '@/components/molecules/navbar/navbar';
import styles from './odyssey.module.scss';
import Video from 'next-video';
import getStarted from '/videos/get-started.mp4';
import { motion } from 'framer-motion';
import VideoChip from '@/components/atoms/videochip/videochip';

const containerVariants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.785, 0.135, 0.15, 0.86],
        },
    },
};

export default function OdysseyPage() {
    return (
        <div className={styles.wraper}>
            <div className={styles.container}>
                <NavBar />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.5,
                        ease: [0.785, 0.135, 0.15, 0.86],
                    }}
                    className={styles.playerwraper}>
                    <div style={{ borderRadius: '1rem', width: '100%', height: '100%', overflow: 'hidden' }}>
                        <Video className={styles.playercomp} style={{ width: '100%', height: '100%' }} src={getStarted} />
                    </div>
                    <div className={styles.videolabel}>
                        <p className={styles.eplabel}>Episode one</p>
                        <h2 className={styles.title}>
                            Visual composition and technique library
                        </h2>
                    </div>

                </motion.div>
            </div>
        </div >
    );
}