"use client";
import Navbar from "@/components/molecules/navbar/navbar";
import styles from "./getstarted.module.scss";
import { motion } from "framer-motion";
import Footer from "@/components/molecules/footer/footer";
import Icon from "@/components/atoms/icons";


export default function Home() {
    return (
        <>
            <div className={styles.container}>

                <Navbar />
                <div className={styles.containerwraper}>
                    <div className={styles.leftpadding}></div>

                    <motion.div
                        initial={{ filter: 'blur(10px)' }}
                        animate={{ filter: 'blur(0px)' }}

                        transition={{
                            duration: 0.4,
                            delay: 0.1,
                            ease: [0.785, 0.135, 0.15, 0.86],
                        }}
                        className={styles.headerwraper}>

                        <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 0 30 44" fill="none">
                            <path d="M22 15.3333C20.2319 15.3333 18.5362 16.0357 17.286 17.286C16.0357 18.5362 15.3333 20.2319 15.3333 22C15.3333 23.7681 16.0357 25.4638 17.286 26.714C18.5362 27.9643 20.2319 28.6667 22 28.6667C23.7681 28.6667 25.4638 27.9643 26.714 26.714C27.9643 25.4638 28.6667 23.7681 28.6667 22C28.6667 20.2319 27.9643 18.5362 26.714 17.286C25.4638 16.0357 23.7681 15.3333 22 15.3333ZM22 15.3333H15.3333M22 15.3333C23.7681 15.3333 25.4638 14.631 26.714 13.3807C27.9643 12.1305 28.6667 10.4348 28.6667 8.66667C28.6667 6.89856 27.9643 5.20286 26.714 3.95262C25.4638 2.70238 23.7681 2 22 2H15.3333M8.66667 28.6667C6.89856 28.6667 5.20286 29.369 3.95262 30.6193C2.70238 31.8695 2 33.5652 2 35.3333C2 37.1014 2.70238 38.7971 3.95262 40.0474C5.20286 41.2976 6.89856 42 8.66667 42C10.4348 42 12.1305 41.2976 13.3807 40.0474C14.631 38.7971 15.3333 37.1014 15.3333 35.3333V28.6667M8.66667 28.6667H15.3333M8.66667 28.6667C6.89856 28.6667 5.20286 27.9643 3.95262 26.714C2.70238 25.4638 2 23.7681 2 22C2 20.2319 2.70238 18.5362 3.95262 17.286C5.20286 16.0357 6.89856 15.3333 8.66667 15.3333M15.3333 28.6667V15.3333M15.3333 2V15.3333M15.3333 2H8.66667C6.89856 2 5.20286 2.70238 3.95262 3.95262C2.70238 5.20286 2 6.89856 2 8.66667C2 10.4348 2.70238 12.1305 3.95262 13.3807C5.20286 14.631 6.89856 15.3333 8.66667 15.3333M15.3333 15.3333H8.66667" stroke="white" strokeWidth="2.45614" />
                        </svg>

                        <h1 className={styles.heading}>
                            Getting Started
                            <br />
                            <span className={styles.subcontainer}>
                                with
                                <span className={styles.minicontainer}>

                                    <svg xmlns="http://www.w3.org/2000/svg" height="36" viewBox="0 0 67 84" fill="none">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M50 0H67V17H50V0ZM55 5V12H62V5H55Z" fill="#3D97E5" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M0 0H17V17H0V0ZM5 5V12H12V5H5Z" fill="#3D97E5" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M0 67H17V84H0V67ZM5 72V79H12V72H5Z" fill="#3D97E5" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M50 67H67V84H50V67ZM55 72V79H62V72H55Z" fill="#3D97E5" />
                                        <path d="M6 13H11V71H6V13Z" fill="#3D97E5" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M10 14H7V70H10V14ZM6 13V71H11V13H6Z" fill="#3D97E5" />
                                        <path d="M56 14H61V72H56V14Z" fill="#3D97E5" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M60 15H57V71H60V15ZM56 14V72H61V14H56Z" fill="#3D97E5" />
                                        <path d="M13 11V6H53V11H13Z" fill="#3D97E5" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M14 7V10H52V7H14ZM13 11H53V6H13V11Z" fill="#3D97E5" />
                                        <path d="M14 78V73H54V78H14Z" fill="#3D97E5" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M15 74V77H53V74H15ZM14 78H54V73H14V78Z" fill="#3D97E5" />
                                    </svg>
                                    Figma
                                </span>
                            </span>

                            <motion.svg
                                initial={{ x: '20rem', y: '10rem' }}
                                animate={{ x: '0rem', y: '-15rem' }}

                                transition={{
                                    duration: 0.4,
                                    delay: 0.1,
                                    ease: [0.785, 0.135, 0.15, 0.86],
                                }}

                                className={styles.cursor} xmlns="http://www.w3.org/2000/svg" height="26" viewBox="0 0 48 51" fill="none">
                                <path d="M11.5 43.5L4 5L39.5 26L19.5 28.5L11.5 43.5Z" stroke="#FFC43E" strokeWidth="5" />
                            </motion.svg>

                        </h1>

                        
                    </motion.div>

                </div>


                <Footer />
            </div>

        </>
    );
}
