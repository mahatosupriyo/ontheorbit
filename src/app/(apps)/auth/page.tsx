"use client"

import React, { useEffect, useState } from 'react'
import styles from './auth.module.scss'
import Icon from '@/components//atoms/icons/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Lottie from 'lottie-react'
import animationData from '../../../../public/Essentials/lottie/Security Shield.json'
import Link from 'next/link'
import Tooltip from '@/components/ui/tooltip/tooltip'

/**
 * Animation Variants
 * centralizes the motion logic for cleaner JSX
 */
const fadeVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.3, ease: "easeIn" }
    }
}

/**
 * AuthPage component
 * - Handles authentication UI with Google.
 * - Enforces a minimum 1-second splash screen (Lottie) for smooth UX.
 * - Uses Framer Motion for seamless state transitions.
 */
export default function AuthPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    // State to ensure the animation plays for at least 1 second
    const [isMinimumLoadTimePassed, setIsMinimumLoadTimePassed] = useState(false)

    /**
     * Effect: Enforce Minimum Loading Time
     * This prevents the "flicker" if next-auth loads instantly.
     * The loader will show for at least 1000ms.
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMinimumLoadTimePassed(true)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    /**
     * Effect: Redirect if Authenticated
     * We wait for the minimum time to pass before redirecting to ensure
     * the user sees a smooth sequence, not a choppy redirect.
     */
    useEffect(() => {
        if (status === "authenticated" && isMinimumLoadTimePassed) {
            router.replace("/")
        }
    }, [status, router, isMinimumLoadTimePassed])

    /**
     * Handle provider sign-in.
     */
    const handleSignIn = async (providerName: string) => {
        try {
            await signIn(providerName, { callbackUrl: '/' })
        } catch (error) {
            console.error('Sign-in failed:', error)
        }
    }

    // Calculate if we should still be showing the loader
    // It is loading if: NextAuth is loading OR The 1s timer hasn't finished OR we are authenticated (waiting for redirect)
    const isLoading = status === "loading" || !isMinimumLoadTimePassed || status === "authenticated"

    return (
        <div className={styles.authwraper}>
            {/* AnimatePresence with mode='wait' ensures the exit animation 
                of the loader finishes before the entry animation of the form starts.
            */}
            <AnimatePresence mode='wait'>

                {isLoading ? (
                    /* ---------------- LOADING STATE (LOTTIE) ---------------- */
                    <motion.div
                        key="loader"
                        className={styles.authcontainer}
                        variants={fadeVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <div className={styles.lottiewraper}>
                            <Lottie
                                animationData={animationData}
                                style={{ height: '100px', zIndex: 10, padding: '1rem', boxSizing: 'content-box' }}
                                loop
                                autoplay
                            />
                        </div>
                    </motion.div>
                ) : (
                    /* ---------------- CONTENT STATE (FORM) ---------------- */
                    <motion.div
                        key="content"
                        className={styles.authcontainer}
                        variants={fadeVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Branding logo */}
                        <Link href="/" style={{ textDecoration: 'none' }}>
                            <Tooltip direction='bottom' content='go home'>
                                <Icon name='oto' fill='#fff' size={40} />
                            </Tooltip>
                        </Link>

                        {/* Google Sign-In Button */}
                        <div className={styles.btnwraper}>
                            <motion.button
                                whileTap={{ opacity: 0.8 }}
                                className={styles.authbtn}
                                onClick={() => handleSignIn('google')}
                            >
                                <img
                                    className={styles.providericon}
                                    src="https://ik.imagekit.io/ontheorbit/Essentials/GoogleProvider.svg?updatedAt=1747472834072"
                                    draggable="false"
                                    alt="Google Provider"
                                />
                            </motion.button>
                        </div>

                        {/* Legal and privacy notice */}
                        <p className={styles.authfooter}>
                            By continuing, you agree to our{' '}
                            <a
                                target='_blank'
                                rel="noopener noreferrer"
                                className={styles.linkinline}
                                href="https://www.ontheorbit.com/company/legals"
                            >
                                Legal terms
                            </a>{' '}
                            and{' '}
                            <a
                                target='_blank'
                                rel="noopener noreferrer"
                                className={styles.linkinline}
                                href="https://www.ontheorbit.com/company/legals"
                            >
                                Privacy policy
                            </a>.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}