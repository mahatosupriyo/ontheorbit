import styles from "../subscriptions.module.scss";
import Icon from "@/components/atoms/icons/icons";
import { formatDate } from "../utils";

export function DateGrid({ startDate, validityDays }: { startDate: Date; validityDays: number }) {
    const endDate = new Date(startDate.getTime() + (validityDays * 86400000));

    return (
        <div className={styles.dateGrid}>
            <div className={styles.dateItem}>
                <Icon name="calender" size={26} fill="#fff" />
                <span className={styles.label}>Started on</span>
                <span className={styles.value}>{formatDate(startDate)}</span>
            </div>
            <div className={styles.dateItem}>
                <Icon name="clock" size={26} fill="#fff" />
                <span className={styles.label}>Ends on</span>
                <span className={styles.value}>{formatDate(endDate)}</span>
            </div>
        </div>
    );
}