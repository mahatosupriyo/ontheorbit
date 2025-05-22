import NavBar from '@/components/molecules/navbar/navbar';
import styles from './odyssey.module.scss';
import Video from 'next-video';
import getStarted from '/videos/get-started.mp4';


export default function OdysseyPage() {
    return (
        <div className={styles.wraper}>
            <div className={styles.container}>
                <NavBar />
                <div className={styles.playerwraper}>
                    <div style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                        <Video src={getStarted} />
                    </div>
                </div>
            </div>
        </div>
    );
}