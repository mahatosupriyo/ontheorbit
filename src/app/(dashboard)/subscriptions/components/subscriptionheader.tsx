import styles from "../subscriptions.module.scss";

export function SubscriptionHeader({ planName }: { planName: string }) {
    return (
        <div className={styles.header}>
            <span className={styles.label}>Current</span>
            <h1 className={styles.title}>{planName}</h1>
        </div>
    );
}