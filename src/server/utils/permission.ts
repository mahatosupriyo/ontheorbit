/**
 * Subscription Access Control
 * ---------------------------
 * Centralized permission check that determines whether a user
 * should have access to paid features based on:
 * - Subscription existence
 * - Plan validity window
 * - Installment payment progress
 * - Grace period handling
 */

import { db } from "@/server/db"; // Database client
import { subscriptions, plans } from "@/server/db/schema/commerce"; // Commerce schemas
import { eq, and } from "drizzle-orm"; // Query helpers

/**
 * AccessStatus
 * ------------
 * Represents the final access state for a user.
 *
 * GRANTED           → Full access, no restrictions
 * PAYMENT_DUE_SOON  → Access still granted, but installment due within 30 days
 * NO_SUBSCRIPTION   → User has no active subscription
 * OVERDUE_PAYMENT   → Installment overdue, access revoked
 * EXPIRED           → Plan validity window fully expired
 */
export type AccessStatus =
    | "GRANTED"
    | "PAYMENT_DUE_SOON"
    | "NO_SUBSCRIPTION"
    | "OVERDUE_PAYMENT"
    | "EXPIRED";

/**
 * PermissionResult
 * ----------------
 * Normalized response object returned by `checkSubscriptionAccess`
 */
interface PermissionResult {
    status: AccessStatus; // Final access state
    subscription?: typeof subscriptions.$inferSelect & {
        plan: typeof plans.$inferSelect;
    }; // Active subscription + plan details
    message?: string; // Optional human-readable explanation
    nextDueDate?: Date | null; // When the next installment is due
    daysUntilDue?: number; // Remaining days until payment is required
}

/**
 * checkSubscriptionAccess
 * -----------------------
 * Determines whether a user currently has access to paid content.
 *
 * This function is intentionally strict and time-based to ensure:
 * - Predictable installment coverage
 * - Grace-period enforcement
 * - Clear downgrade paths
 */
export async function checkSubscriptionAccess(
    userId: string
): Promise<PermissionResult> {

    // --------------------------------------------------
    // 1. Fetch Active Subscription (status = ACTIVE)
    // --------------------------------------------------
    const sub = await db.query.subscriptions.findFirst({
        where: and(
            eq(subscriptions.userId, userId),
            eq(subscriptions.status, "ACTIVE")
        ),
        with: { plan: true }, // Eager-load plan details
    });

    // No active subscription → no access
    if (!sub) {
        return {
            status: "NO_SUBSCRIPTION",
            message: "User has no active subscription.",
        };
    }

    // --------------------------------------------------
    // 2. Check Overall Plan Validity Window
    // --------------------------------------------------
    const now = new Date();
    const startDate = sub.startDate!;
    const planValidityDays = sub.plan.validityDays;

    // Safety check: validity must exist
    if (!planValidityDays) {
        return {
            status: "EXPIRED",
            subscription: sub,
            message: "Plan validity is not set.",
        };
    }

    // Compute absolute expiry date
    const expiryDate = new Date(
        startDate.getTime() + planValidityDays * 86400000
    );

    // Plan validity exceeded → access permanently expired
    if (now > expiryDate) {
        return {
            status: "EXPIRED",
            subscription: sub,
            message: "Plan validity has expired.",
        };
    }

    // --------------------------------------------------
    // 3. Check Installment Payment State
    // --------------------------------------------------
    const totalInstallments = sub.plan.totalInstallments || 1;

    // Defensive default: assume at least one installment paid
    const paidCount = sub.installmentsPaid || 1;

    // Fully paid → access granted for entire validity window
    if (paidCount >= totalInstallments) {
        return {
            status: "GRANTED",
            subscription: sub,
        };
    }

    // --------------------------------------------------
    // 4. Calculate Time Coverage by Installments
    // --------------------------------------------------
    /**
     * Example:
     * - Plan validity: 365 days
     * - Total installments: 2
     * - Each installment covers ~182.5 days
     */
    const daysCoveredPerInstallment =
        planValidityDays / totalInstallments;

    const totalDaysCovered =
        daysCoveredPerInstallment * paidCount;

    // Exact cutoff time for paid coverage
    const coverageEndDate = new Date(
        startDate.getTime() + totalDaysCovered * 86400000
    );

    // --------------------------------------------------
    // 5. Grace Period Handling
    // --------------------------------------------------
    /**
     * Grace period exists to avoid harsh cutoffs due to:
     * - Payment delays
     * - Timezone differences
     * - Minor scheduling drift
     */
    const gracePeriodHours = 24;

    const strictCutoff = new Date(
        coverageEndDate.getTime() + gracePeriodHours * 3600000
    );

    // Days remaining until installment is due
    const daysUntilDue = Math.ceil(
        (coverageEndDate.getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // --------------------------------------------------
    // A. Overdue → Access Revoked
    // --------------------------------------------------
    if (now > strictCutoff) {
        return {
            status: "OVERDUE_PAYMENT",
            subscription: sub,
            nextDueDate: coverageEndDate,
            daysUntilDue,
            message: `Installment overdue. Your access expired on ${coverageEndDate.toDateString()}.`,
        };
    }

    // --------------------------------------------------
    // B. Payment Reminder Window (≤ 30 days)
    // --------------------------------------------------
    if (daysUntilDue <= 30) {
        return {
            status: "PAYMENT_DUE_SOON",
            subscription: sub,
            nextDueDate: coverageEndDate,
            daysUntilDue,
            message: `Upcoming payment. Due in ${daysUntilDue} days.`,
        };
    }

    // --------------------------------------------------
    // C. All Good → Access Granted
    // --------------------------------------------------
    return {
        status: "GRANTED",
        subscription: sub,
        nextDueDate: coverageEndDate,
        daysUntilDue,
    };
}
