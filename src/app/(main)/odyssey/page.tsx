"use client";
import NavBar from '@/components/molecules/navbar/navbar';
import styles from './odyssey.module.scss';
import Video from 'next-video';
import getStarted from '/videos/get-started.mp4';
import { motion } from 'framer-motion';

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
                <div className={styles.playerwraper}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.5,
                            ease: [0.785, 0.135, 0.15, 0.86],
                        }}
                        style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                        <Video src={getStarted} />
                    </motion.div>
                </div>
            </div>
        </div >
    );
}