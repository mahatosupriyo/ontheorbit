import Tooltip from "@/components/ui/tooltip/tooltip";
import styles from "../subscriptions.module.scss";
import { CancelSubscriptionButton } from "@/app/(dashboard)/subscriptions/components/cancelsubbutton";

export function DangerZone() {
    return (
        <div className={styles.dangerSection}>
            <div className={styles.dangerContent}>
                <span className={styles.dangerLabel}>Danger zone</span>
                <h3 className={styles.sectionSubtitle}>Cancel subscription</h3>
                <p className={styles.dangerDesc}>
                    You can cancel your subscription within the first 7 days for a full refund.*
                </p>
            </div>
            <Tooltip content="Cancellation is irreversible">
                <CancelSubscriptionButton />
            </Tooltip>
        </div>
    );
}