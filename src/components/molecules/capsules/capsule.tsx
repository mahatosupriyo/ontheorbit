import Link from "next/link";
import styles from "./capsule.module.scss";
import { motion } from "framer-motion";
import Icon from "@/components/atoms/icons";

interface CapsuleProps {
    imgSrc: string;
    href?: string;
    alt?: string;
}

export default function CapsuleCard({ imgSrc, href = "/garage", alt = "Capsule Image" }: CapsuleProps) {
    return (
        <Link href={href} draggable="false" className={styles.capsulebtn}>
            <img
                src={imgSrc}
                alt={alt}
                draggable="false"
                className={styles.capsulebanner}
            />

            <motion.button whileTap={{ scale: 0.9 }} className={styles.save}>
                <Icon name='save' size={28} />
            </motion.button>
        </Link>
    );
}