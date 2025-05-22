import NavBar from '@/components/molecules/navbar/navbar';
import styles from './odyssey.module.scss';
export default function OdysseyPage() {
    return (
        <div className={styles.wraper}>
            <div className={styles.container}>
                <NavBar />
                {/* <h1>Odyssey</h1>
                <p>Welcome to the Odyssey page!</p> */}
            </div>
        </div>
    );
}