import { auth } from "@/auth";
import { db } from "@/server/db";
import { subscriptions } from "@/server/db/schema/commerce";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { CancelSubscriptionButton } from "./components/component"; // Local Import
import styles from "./test.module.scss"; // Styles

// --- Helper for Status Badge ---
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "ACTIVE":
      return (
        <div className={`${styles.badge} ${styles.badgeActive}`}>
          <CheckCircle2 /> Active Plan
        </div>
      );
    case "REFUND_PROCESSING":
      return (
        <div className={`${styles.badge} ${styles.badgeProcessing}`}>
          <Clock /> Refund Processing
        </div>
      );
    case "REFUNDED":
      return (
        <div className={`${styles.badge} ${styles.badgeRefunded}`}>
          <CheckCircle2 /> Refunded
        </div>
      );
    case "CANCELED":
      return (
        <div className={`${styles.badge} ${styles.badgeCanceled}`}>
          <XCircle /> Canceled
        </div>
      );
    default:
      return (
        <div className={`${styles.badge} ${styles.badgeDefault}`}>
          {status}
        </div>
      );
  }
}

export default async function PaymentTestPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // 1. Fetch Subscription
  const sub = await db.query.subscriptions.findFirst({
    where: and(eq(subscriptions.userId, session.user.id)),
    with: { plan: true },
    orderBy: (subscriptions, { desc }) => [desc(subscriptions.createdAt)],
  });

  if (!sub) {
    return (
      <div className={styles.emptyState}>
        <AlertCircle style={{ width: 48, height: 48, color: '#52525b', marginBottom: 16 }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>No Subscription Found</h1>
        <p style={{ color: '#71717a' }}>You haven't purchased any plan yet.</p>
      </div>
    );
  }

  // 2. Calculate Days Active
  const daysActive = sub.startDate
    ? Math.round(Math.abs((new Date().getTime() - sub.startDate.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.pageTitle}>Payment Status Console</h1>

        {/* --- MAIN STATUS CARD --- */}
        <div className={styles.card}>
          
          {/* Header */}
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.subLabel}>Current Plan</p>
              <h2 className={styles.planTitle}>{sub.plan.title}</h2>
              <p className={styles.planId}>ID: {sub.id.substring(0, 8)}...</p>
            </div>
            <StatusBadge status={sub.status || "UNKNOWN"} />
          </div>

          {/* Body Details */}
          <div className={styles.cardBody}>
            <div>
              <p className={styles.subLabel}>Start Date</p>
              <p className={styles.valueText}>
                {sub.startDate ? sub.startDate.toDateString() : "N/A"}
              </p>
            </div>
            <div>
              <p className={styles.subLabel}>Price Paid</p>
              <p className={styles.valueText}>
                ₹{(sub.plan.price / 100).toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className={styles.subLabel}>Days Active</p>
              <p className={`${styles.valueText} ${daysActive > 7 ? styles.textRed : styles.textGreen}`}>
                {daysActive} Days
              </p>
            </div>
            <div>
              <p className={styles.subLabel}>Cancel Window</p>
              <p className={`${styles.valueText} ${styles.textGray}`}>
                {daysActive <= 7 ? "Open (Guarantee Period)" : "Closed (> 7 Days)"}
              </p>
            </div>
          </div>

          {/* --- FOOTER ACTIONS --- */}
          <div className={styles.cardFooter}>
            
            {/* SCENARIO 1: ACTIVE */}
            {sub.status === "ACTIVE" && (
              <div className={styles.footerRow}>
                <div className={styles.footerText}>
                  {daysActive <= 7
                    ? "You are within the 7-day money-back guarantee period."
                    : "Cancellation period has expired."}
                </div>
                {/* Only show button if eligible (optional UI choice, or disable it inside button) */}
                <CancelSubscriptionButton />
              </div>
            )}

            {/* SCENARIO 2: REFUND PROCESSING */}
            {sub.status === "REFUND_PROCESSING" && (
              <div className={`${styles.alert} ${styles.alertYellow}`}>
                <Clock />
                <div>
                  <h4>Refund Initiated</h4>
                  <p>We have sent the refund request to the bank. It may take 5-7 business days to reflect in your account.</p>
                </div>
              </div>
            )}

            {/* SCENARIO 3: REFUNDED */}
            {sub.status === "REFUNDED" && (
              <div className={`${styles.alert} ${styles.alertGray}`}>
                <CheckCircle2 style={{ color: '#9ca3af' }} />
                <div>
                  <h4>Refund Complete</h4>
                  <p>The amount has been successfully refunded to your original payment method.</p>
                </div>
              </div>
            )}

            {/* SCENARIO 4: CANCELED */}
            {sub.status === "CANCELED" && (
              <div className={`${styles.alert} ${styles.alertRed}`}>
                <XCircle />
                <div>
                  <h4>Subscription Canceled</h4>
                  <p>This plan is no longer active.</p>
                </div>
              </div>
            )}

          </div>
        </div>

        <p className={styles.infoText}>
          Status updates automatically via Webhooks. <br />
          Refresh this page to see the latest database state.
        </p>
      </div>
    </div>
  );
}