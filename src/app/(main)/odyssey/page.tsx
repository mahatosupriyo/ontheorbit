"use client";
import NavBar from '@/components/molecules/navbar/navbar';
import styles from './odyssey.module.scss';
import Video from 'next-video';
import getStarted from '/videos/get-started.mp4';
import { motion } from 'framer-motion';
import Icon from '@/components/atoms/icons';
import Link from 'next/link';
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
                <div className={styles.playerwraper}>

                    <motion.div
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={containerVariants}
                        className={styles.playercontainer}>
                        <motion.div variants={itemVariants} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                            <Video className={styles.playercomp} style={{ width: '100%', userSelect: 'none', pointerEvents: 'none', height: '100%' }} src={getStarted} />
                        </motion.div>
                        <motion.div className={styles.videochipwraper}
                            variants={containerVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            <motion.h1 variants={itemVariants} className={styles.wraperheader}>Made for you</motion.h1>

                            <motion.div variants={itemVariants}>

                                <VideoChip
                                    videourl='/'
                                    imageBanner='https://i.pinimg.com/736x/48/2b/22/482b22ce795d2868d307a82d69d74082.jpg'
                                    label='Episode one'
                                    title='Visual composition and technique library'
                                />

                            </motion.div>

                            <motion.div variants={itemVariants}>

                                <VideoChip
                                    videourl='/'
                                    imageBanner='https://i.pinimg.com/736x/73/4e/e1/734ee14b886e273d70442a7dcddc48e9.jpg'
                                    label='Episode two'
                                    title='You Can Do It | Out of Home | D&AD Awards 2024 Shortlist'
                                />

                            </motion.div>

                            <motion.div variants={itemVariants}>


                                <VideoChip
                                    videourl='/'
                                    imageBanner='https://i.pinimg.com/736x/f9/56/43/f9564358e9b356d8bed014e5dfb4500e.jpg'
                                    label='Episode three'
                                    title='Jush! - Edgar Bąk'
                                />

                            </motion.div>

                        </motion.div>
                    </motion.div>

                    <div className={styles.videolabel}>

                        <div className={styles.videoinfo}>
                            <p className={styles.eplabel}>Episode one</p>
                            <h2 className={styles.title}>
                                Visual composition and technique library
                            </h2>
                        </div>


                    </div>

                </div>
            </div>
        </div >
    );
}