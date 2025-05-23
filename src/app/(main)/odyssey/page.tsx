"use client";
import NavBar from '@/components/molecules/navbar/navbar';
import styles from './odyssey.module.scss';
import Video from 'next-video';
import getStarted from '/videos/get-started.mp4';
import { motion } from 'framer-motion';
import Icon from '@/components/atoms/icons';
import Link from 'next/link';

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
                        <Video className={styles.playercomp} style={{ width: '100%', userSelect: 'none', pointerEvents: 'none', height: '100%' }} src={getStarted} />
                    </div>
                    <div className={styles.videolabel}>

                        <div className={styles.videoinfo}>
                            <p className={styles.eplabel}>Episode one</p>
                            <h2 className={styles.title}>
                                Visual composition and technique library
                            </h2>
                        </div>

                        <motion.div
                            whileTap={{ scale: 0.96 }}
                        >
                            <Link href="/" draggable="false" className={styles.nextbutton}>
                                <Icon name='play' size={24} fill='#fff' />
                                Next
                            </Link>
                        </motion.div>



                    </div>

                </motion.div>
            </div>
        </div >
    );
}