"use client"
import Link from 'next/link';
import styles from './footer.module.scss'
import Icon from '@/components/atoms/icons';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerwraper}>


                <div className={styles.footercontent}>

                    <div className={styles.linklist}>

                        <div className={styles.linkcolumn}>
                            <p className={styles.linklabel}>Features</p>
                            <Link draggable="false" href="/" className={styles.linkitem}>Garage</Link>
                            <Link draggable="false" href="/" className={styles.linkitem}>Space</Link>
                            <Link draggable="false" href="/" className={styles.linkitem}>Voyager</Link>
                        </div>

                        <div className={styles.linkcolumn}>
                            <p className={styles.linklabel}>Resources</p>

                            <Link draggable="false" href="/" className={styles.linkitem}>Blogs</Link>
                            <Link draggable="false" href="/" className={styles.linkitem}>Press Kit</Link>
                        </div>

                        <div className={styles.linkcolumn}>

                            <p className={styles.linklabel}>Company</p>

                            <Link draggable="false" href="/" className={styles.linkitem}>About us</Link>
                            <Link draggable="false" href="/" className={styles.linkitem}>Careers</Link>
                        </div>

                        <div className={styles.linkcolumn}>

                            <p className={styles.linklabel}>Legals</p>

                            <Link draggable="false" href="/" className={styles.linkitem}>Terms</Link>
                            <Link draggable="false" href="/" className={styles.linkitem}>Privacy</Link>
                            <Link draggable="false" href="/" className={styles.linkitem}>Refund</Link>
                        </div>

                    </div>

                    <div className={styles.socialscontainer}>
                        <Icon name='oto' fill={'#fff'} size={72} />

                        <div className={styles.socials}>
                            <Link target="_blank" draggable="false" href="https://www.linkedin.com/company/ontheorbit" className={styles.socialmedialink}>
                                <Icon name='linkedin' fill={'#fff'} size={34} />
                            </Link>

                            <Link target="_blank" draggable="false" href="https://www.instagram.com/ontheorbitdotcom/" className={styles.socialmedialink}>
                                <Icon name='instagram' fill={'#fff'} size={34} />
                            </Link>

                            <Link target="_blank" draggable="false" href="https://www.youtube.com/@ontheorbitdotcom" className={styles.socialmedialink}>
                                <Icon name='x' fill={'#fff'} size={34} />
                            </Link>
                        </div>
                    </div>

                </div>
                <div className={styles.footercontent}>
                    <p style={{ textWrap: 'nowrap' }}>&copy; 2025 On The Orbit.</p>
                    <p>
                        All rights reserved. No part of this website or its content may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of On The Orbit, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law. For permission requests, contact On The Orbit.
                    </p>
                </div>

            </div>
        </footer>
    );
}

