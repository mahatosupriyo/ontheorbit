import Link from "next/link";
import styles from "../subscriptions.module.scss";
import Icon from "@/components/atoms/icons/icons";
import { BuyNowButton } from "@/app/(pricing)/pricingcomponents/admin/buybtn";
import { formatCurrency, formatDate } from "../utils";

interface ProgressProps {
    subscription: any; // Type strictly with your Drizzle schema
    status: string;
    nextDueDate: Date | null | undefined;
}

export function ProgressSection({ subscription, status, nextDueDate }: ProgressProps) {
    const isSubscribed = !!subscription;

    // Calculate Derived State
    const planPrice = subscription?.plan.price || 0;
    const totalInstallments = subscription?.plan.totalInstallments || 1;
    const installmentsPaid = subscription?.installmentsPaid || 0;
    const nextAmount = Math.floor(planPrice / totalInstallments);
    const progressPercent = isSubscribed ? (installmentsPaid / totalInstallments) * 100 : 0;
    const isOverdue = status === "OVERDUE_PAYMENT";

    // Label Logic
    let label = "Free";
    if (isSubscribed) {
        if (isOverdue) label = `${Math.round(100 - progressPercent)}% overdue`;
        else if (installmentsPaid >= totalInstallments) label = "Fully Paid";
        else label = `${Math.round(progressPercent)}% Paid`;
    }

    return (
        <div className={styles.section}>
            <Icon name="payment" size={26} fill="#fff" />
            <div className={styles.progressBlock}>
                <span className={styles.label}>Payment progress</span>
                <h2 className={styles.sectionTitle}>{label}</h2>
                <div className={styles.track}>
                    <div
                        className={`${styles.fill} ${isOverdue ? styles.error : ''}`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {isOverdue && (
                <div className={styles.alertBox}>
                    <span className={styles.alertText}>
                        Pay before {formatDate(nextDueDate)} to continue
                    </span>
                    <BuyNowButton
                        planId={subscription.plan.id}
                        paymentMode="INSTALLMENT"
                        buttonLabel={formatCurrency(nextAmount)}
                    />
                </div>
            )}

            {!isSubscribed && (
                <Link href="/pricing" className={styles.browseBtn}>
                    Browse plans
                </Link>
            )}
        </div>
    );
}