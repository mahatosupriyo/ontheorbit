"use client";
import Navbar from "@/components/molecules/navbar/navbar";
import styles from "./home.module.scss";
import { motion } from "framer-motion";
import Footer from "@/components/molecules/footer/footer";
import GarageCards from "@/components/landing/garagecards/garagecard";
import FAQ from "@/components/atoms/faq/faq";

const faqs = [
  {
    question: "What is On The Orbit (OTO)?",
    answer:
      "On The Orbit (OTO) is a platform designed to help designers and developers showcase their work, connect with like-minded individuals, and explore curated content.",
  },
  {
    question: "Is On The Orbit free to use?",
    answer:
      "Yes, we offer a free plan with essential features. There are premium plans for advanced tools and customization options.",
  },

  {
    question: "How do I contact support if I need help?",
    answer:
      "You can reach out to OTO support through the help center or via email at support@ontheorbit.com.",
  }
];


export default function Home() {
  return (
    <>
      <div className={styles.container}>

        <Navbar />
        <div className={styles.containerwraper}>
          <motion.div
            initial={{ minHeight: '0%' }}
            animate={{ minHeight: '100%' }}
            transition={{
              duration: 0.4,
              ease: [0.785, 0.135, 0.15, 0.86],
            }}
            className={styles.background}>

          </motion.div>
          <div className={styles.leftpadding}></div>

          <div className={styles.headerwraper}>

            <motion.h1
              className={styles.centeredtxt}
              initial={{ filter: 'blur(10px)' }}
              animate={{ filter: 'blur(0px)' }}
              transition={{
                duration: 0.4,
                ease: [0.785, 0.135, 0.15, 0.86],
              }}
            >
              <motion.span style={{ paddingLeft: '30%' }}>Forget</motion.span> <span className={styles.theory}>Theory <svg className={styles.underline} xmlns="http://www.w3.org/2000/svg" width="1950" height="111" viewBox="0 0 1950 111">
                <motion.path initial={{ pathLength: 0 }} transition={{ duration: 0.6, delay: 0.3, yoyo: Infinity, ease: "easeInOut" }} fill={'transparent'} animate={{ pathLength: 1 }} d="M12.5801 25.9796C265.971 16.5947 518.765 52.6558 770.67 74.025C1088.59 100.994 1417.11 116.4 1733 60.0192C1783.73 50.9649 1834 38.4879 1883.87 25.625C1900.53 21.3291 1950.89 11.6862 1933.69 12.151C1870.35 13.8629 1805.16 24.7664 1742.39 30.9437C1512.62 53.5563 1282.74 74.312 1052.21 87.4991C936.049 94.1434 819.679 99.2212 703.3 98.6683C645.122 98.3919 583.43 100.37 525.656 91.2221C518.888 90.1506 70.1888 88.2466 77 87.4991C166.279 77.7001 724.66 71.3839 814.284 66.047C977.455 56.3304 1140.75 48.8116 1303.6 34.4895C1309.75 33.9484" strokeWidth="38" strokeLinecap="square" />
              </svg></span>—Learn Design the Way <span className={styles.pro}>Pros <svg className={styles.prologo} xmlns="http://www.w3.org/2000/svg" fill={'transparent'} height="79" viewBox="0 0 171 379">
                <motion.path initial={{ pathLength: 0 }} transition={{ duration: 0.4, delay: 0.4, yoyo: Infinity, easings: [0.42, 0, 0.58, 1] }} animate={{ pathLength: 1 }} d="M118.266 17C99.526 51.0773 80.5294 84.7584 65.0147 120.289C48.5794 157.929 30.3921 196.273 16.7706 234.841C15.0233 239.788 5.91558 259.22 18.7248 251.108C53.0776 229.351 87.3996 204.476 119.488 179.897C131.383 170.785 142.536 156.796 157.35 151.686C159.252 151.03 159.734 150.138 157.594 152.823C140.797 173.909 127.506 197.602 115.091 221.076C91.6504 265.396 67.3343 315.545 66.3582 366" stroke={'#9cfce1f5'} strokeWidth="38" strokeLinecap="square" />
              </svg></span> Do.
            </motion.h1>

            <motion.h2
              initial={{ filter: 'blur(10px)' }}
              animate={{ filter: 'blur(0px)' }}

              transition={{
                duration: 0.4,
                delay: 0.1,
                ease: [0.785, 0.135, 0.15, 0.86],
              }}
              className={styles.description}>

              We’re redefining design education. Become industry-ready with hands-on experience and expert-led modules.
              <motion.svg

                initial={{ x: '20rem', y: '-10rem' }}
                animate={{ x: '10rem', y: '-15rem' }}

                transition={{
                  duration: 0.4,
                  delay: 0.1,
                  ease: [0.785, 0.135, 0.15, 0.86],
                }}

                className={styles.cursor}
                xmlns="http://www.w3.org/2000/svg"
                height="60" viewBox="0 0 48 51"
                fill="transparent"
              >
                <path d="M11.5 43.5L4 5L39.5 26L19.5 28.5L11.5 43.5Z" strokeWidth="5" />
              </motion.svg>
            </motion.h2>



          </div>

        </div>


        {/* <section className={styles.spacesection}>

          <div className={styles.spacecontainer}>
            <div className={styles.spaceheader}>
              <h1 className={styles.sectiontitle}>Garage</h1>
              <h1 className={styles.sectiondesc}>Access a curated hub of design inspirations and resources to spark your next big idea.</h1>
            </div>
            <div className={styles.videocontainer}>
              <video src="https://ik.imagekit.io/ontheorbit/Orbit-Carousel-4x5%20(1).mp4?updatedAt=1740755693972" className={styles.videobanner} autoPlay loop muted></video>
            </div>

          </div>

        </section> */}

        {/* <FAQ faqs={faqs} /> */}
        {/* <GarageCards /> */}

        <Footer />
      </div>

    </>
  );
}
