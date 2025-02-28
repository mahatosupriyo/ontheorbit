"use client";
import Navbar from "@/components/molecules/navbar/navbar";
import styles from "./home.module.scss";
import { motion } from "framer-motion";
import Footer from "@/components/molecules/footer/footer";
import Icon from "@/components/atoms/icons";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <motion.h1
          initial={{ letterSpacing: "2rem", opacity: 0 }}
          animate={{ letterSpacing: "0rem", opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.785, 0.135, 0.15, 0.86] }}
          className={styles.centeredtxt}><span className={styles.high}>Launchpad</span> for <span className={styles.high}>Designers</span>
        </motion.h1>


      </div>
      <section className={styles.spacesection}>

        <div className={styles.spacecontainer}>
          <div className={styles.spaceheader}>
            <h1 className={styles.sectiontitle}>Garage</h1>
            <h1 className={styles.sectiondesc}>Access a curated hub of design inspirations and resources to spark your next big idea.</h1>
          </div>
          <video src="https://ik.imagekit.io/ontheorbit/Orbit-Carousel-4x5%20(1).mp4?updatedAt=1740755693972" className={styles.videobanner} autoPlay loop muted></video>

        </div>

      </section>
      <Footer />
    </>
  );
}
