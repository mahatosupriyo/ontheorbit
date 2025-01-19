"use client";
import Navbar from "@/components/molecules/navbar/navbar";
import styles from "./home.module.scss";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <motion.h5
          initial={{ letterSpacing: "2rem", opacity: 0 }}
          animate={{ letterSpacing: "0.8rem", opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.785, 0.135, 0.15, 0.86] }}
          className={styles.centeredtxt}>on the <span className={styles.high}>orbit</span>
        </motion.h5>


      </div>
    </>
  );
}
