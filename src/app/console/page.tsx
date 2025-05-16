"use client";
import Icon from '@/components/atoms/icons';
import styles from './console.module.scss'
import { motion } from 'framer-motion'

export default function Home() {
    return (
        <>
            <div className={styles.container}>

                <div className={styles.wrap}>

                </div>

                <div className={styles.statusbar}>
                    <div className={styles.statusbarcontent}>

                        <motion.button
                            whileTap={{ opacity: 0.7 }}
                            className={styles.otobtn}>
                            <svg
                                className={styles.otoicon}
                                xmlns="http://www.w3.org/2000/svg" height="26" viewBox="0 0 846 846">
                                <path fillRule="evenodd" clipRule="evenodd" d="M423 487.591C458.396 487.591 487.091 458.896 487.091 423.5C487.091 388.104 458.396 359.409 423 359.409C387.604 359.409 358.909 388.104 358.909 423.5C358.909 458.896 387.604 487.591 423 487.591ZM423 846.5C656.616 846.5 846 657.116 846 423.5C846 189.884 656.616 0.5 423 0.5C189.384 0.5 0 189.884 0 423.5C0 657.116 189.384 846.5 423 846.5Z" />
                            </svg>
                        </motion.button>

                        <motion.button
                            whileTap={{ opacity: 0.7 }}
                            className={styles.otobtn}
                        >
                            <Icon name='series' fill={'#fff'} size={34} />
                        </motion.button>

                        <motion.button
                            whileTap={{ opacity: 0.7 }}
                            className={styles.otobtn}
                        >
                            <Icon name='resources' fill={'#fff'} size={34} />
                        </motion.button>
                    </div>
                </div>
            </div>
        </>
    );
}
