"use client";
import Link from 'next/link';
import styles from './videochip.module.scss';

interface VideoChipProps {
    videourl: string;
    imageBanner: string;
    label: string;
    title: string;
}

export default function VideoChip({ videourl, imageBanner, label, title }: VideoChipProps) {
    return (
        <div className={styles.videochipwraper}>
            <Link href={videourl} className={styles.videolink}>
                <img
                    src={imageBanner}
                    draggable="false"
                    className={styles.videobanner}
                    alt={title}
                />
                <div className={styles.videoinfo}>
                    <p className={styles.label}>{label}</p>
                    <h3 className={styles.videotitle}>{title}</h3>
                </div>
            </Link>
        </div>
    );
}