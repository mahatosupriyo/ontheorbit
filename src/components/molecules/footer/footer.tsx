import Link from 'next/link';
import styles from './footer.module.scss'
import { motion } from 'framer-motion'
import Icon from '@/components/atoms/icons';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerwraper}>


                <div className={styles.linklist}>

                    <div className={styles.linkcolumn}>
                        <p className={styles.linklabel}>Features</p>
                        <Link href="/" className={styles.linkitem}>Garage</Link>
                        <Link href="/" className={styles.linkitem}>Space</Link>
                        <Link href="/" className={styles.linkitem}>Voyager</Link>
                    </div>

                    <div className={styles.linkcolumn}>
                        <p className={styles.linklabel}>Resources</p>

                        <Link href="/" className={styles.linkitem}>Blogs</Link>
                        <Link href="/" className={styles.linkitem}>Press Kit</Link>
                    </div>

                    <div className={styles.linkcolumn}>
                        
                        <p className={styles.linklabel}>Company</p>

                        <Link href="/" className={styles.linkitem}>About us</Link>
                        <Link href="/" className={styles.linkitem}>Careers</Link>
                    </div>

                    <div className={styles.linkcolumn}>
                        
                        <p className={styles.linklabel}>Legals</p>

                        <Link href="/" className={styles.linkitem}>Terms</Link>
                        <Link href="/" className={styles.linkitem}>Privacy</Link>
                        <Link href="/" className={styles.linkitem}>Refund</Link>
                    </div>

                </div>

                <div className={styles.socialscontainer}>
                    <Icon name='oto' fill={'#fff'} size={68} />

                    <div className={styles.socials}>
                        <Link href="/" className={styles.socialmedialink}>
                            <Icon name='linkedin' fill={'#fff'} size={38} />
                        </Link>

                        <Link href="/" className={styles.socialmedialink}>
                            <Icon name='instagram' fill={'#fff'} size={38} />
                        </Link>

                        <Link href="/" className={styles.socialmedialink}>
                            <Icon name='x' fill={'#fff'} size={38} />
                        </Link>
                    </div>
                </div>


            </div>
        </footer>
    );
}

