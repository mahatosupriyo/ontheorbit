"use client"
import Link from 'next/link';
import styles from './navbar.module.scss';

export default function NavBar() {

    return (
        <nav className={styles.navwraper}>
            <div className={styles.nav}>


                <Link draggable="false" href="/" className={styles.primarybutton}>

                    <img src="https://ik.imagekit.io/ontheorbit/oto.png?updatedAt=1737655889509" height={20} />

                </Link>

                <div className={styles.linkslist}>
                    <Link className={styles.link} href="/">Learn</Link>
                    <Link className={styles.link} href="/">garage</Link>
                    <Link className={styles.link} href="/">Voyager</Link>
                </div>

                <div className={styles.rightwraper}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="9" viewBox="0 0 69 21" fill="none">
                        <path d="M-0.00390625 2H69.0033M0 19.5H69.0072" stroke="white" strokeWidth="3" />
                    </svg>
                </div>


            </div>
        </nav>
    );
}
