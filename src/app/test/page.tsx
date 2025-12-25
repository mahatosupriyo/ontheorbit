import React from 'react'
import styles from './test.module.scss'

function TestPage() {
    return (
        <div className={styles.wraper}>
            <nav className={styles.navbar}>
                <svg xmlns="http://www.w3.org/2000/svg" className={styles.searchicon} viewBox="0 0 24 24">
                    <path d="M21.2508 21.1526L17.9844 17.8856M20.2428 11.6165C20.2428 16.447 16.3269 20.3629 11.4964 20.3629C6.66589 20.3629 2.75 16.447 2.75 11.6165C2.75 6.786 6.66589 2.87012 11.4964 2.87012C16.3269 2.87012 20.2428 6.786 20.2428 11.6165Z" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                What’s up Supriyo, see these new updates.
            </nav>
        </div>
    )
}


export default TestPage
