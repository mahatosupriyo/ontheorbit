import styles from "./subscriptions.module.scss";

export const formatCurrency = (amount: number) =>
    `₹${(amount / 100).toLocaleString('en-IN')}`;

export const formatDate = (date: Date | null | undefined) => {
    if (!date) return "-";
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short', // "Dec"
        year: '2-digit' // "25"
    });
};

export const getStatusConfig = (status: string) => {
    switch (status) {
        case "captured": return { text: "Paid", colorClass: styles.green };
        case "refunded": return { text: "Refunded", colorClass: styles.yellow };
        case "failed": return { text: "Failed", colorClass: styles.red };
        case "created": return { text: "Not attempted", colorClass: styles.red };
        default: return { text: status, colorClass: styles.gray };
    }
};