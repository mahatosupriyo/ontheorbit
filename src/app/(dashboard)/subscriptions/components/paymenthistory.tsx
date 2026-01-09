import styles from "../subscriptions.module.scss";
import { getStatusConfig, formatCurrency } from "../utils";

export function PaymentHistory({ history }: { history: any[] }) {
    return (
        <div className={styles.paysection}>
            <div className={styles.header}>
                <span className={styles.label}>Payment history</span>
                <h2 className={styles.sectionSubtitle}>Receipts</h2>
            </div>

            <div className={styles.historyList}>
                {history.map((pay) => {
                    const { text, colorClass } = getStatusConfig(pay.status);

                    return (
                        <div key={pay.id} className={styles.historyCard}>
                            <div className={styles.mainContent}>
                                <div className={styles.statusRow}>
                                    {text} <span className={`${styles.dot} ${colorClass}`}>•</span>
                                </div>
                                <div className={styles.amount}>{formatCurrency(pay.amount)}</div>

                                <div className={styles.detailItem}>
                                    <span className={styles.label}>Date issued</span>
                                    <span className={styles.value}>
                                        {pay.createdAt?.toLocaleDateString('en-GB', {
                                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                                        }) || "-"}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.metaSection}>
                                    <div className={styles.detailItem}>
                                        <span className={styles.label}>Payment ID</span>
                                        <span className={`${styles.value} ${styles.mono}`}>
                                            {pay.razorpayPaymentId || "Unavailable"}
                                        </span>
                                    </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}