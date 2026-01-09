"use server";

/**
 * Payments & Subscriptions Server Actions
 * ---------------------------------------
 * This file handles:
 * 1. Razorpay order creation (full payment & installments)
 * 2. Subscription cancellation with refund logic
 *
 * All actions are server-only and protected via session checks.
 */

import { razorpay } from "@/server/utils/razorpay"; // Razorpay SDK wrapper
import { db } from "@/server/db"; // Database client
import { plans, payments, subscriptions, batches } from "@/server/db/schema/commerce"; // Commerce schemas
import { auth } from "@/auth"; // Auth.js session helper
import { eq, and, desc } from "drizzle-orm"; // Query helpers
import { revalidatePath } from "next/cache"; // ISR cache invalidation

// ------------------------------------------------------------------
// Basic In-Memory Rate Limit
// ------------------------------------------------------------------
// NOTE:
// - Prevents accidental double-clicks / spam
// - NOT suitable for production at scale
// - Replace with Redis / Upstash / KV in production
const rateLimitMap = new Map<string, number>();

/**
 * checkRateLimit
 * --------------
 * Allows 1 request per user every 2 seconds.
 */
function checkRateLimit(userId: string) {
    const now = Date.now();
    const lastRequest = rateLimitMap.get(userId) || 0;

    // Reject if called too frequently
    if (now - lastRequest < 2000) return false;

    rateLimitMap.set(userId, now);
    return true;
}

/**
 * getDaysDifference
 * -----------------
 * Utility to calculate day difference between two dates.
 * Used for cancellation window checks.
 */
function getDaysDifference(date1: Date, date2: Date) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(
        Math.abs((date1.getTime() - date2.getTime()) / oneDay)
    );
}

// ------------------------------------------------------------------
// 1. CREATE RAZORPAY ORDER
// ------------------------------------------------------------------
// Handles:
// - New plan purchase
// - Installment payments
// - Resuming incomplete checkout flows
export async function createRazorpayOrder(
    planId: string,
    paymentMode: "FULL" | "INSTALLMENT"
) {
    // ----------------------------------------------
    // Authentication Guard
    // ----------------------------------------------
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized." };

    // ----------------------------------------------
    // Security: Rate Limiting
    // ----------------------------------------------
    if (!checkRateLimit(session.user.id)) {
        return { error: "Please wait a moment before trying again." };
    }

    // ----------------------------------------------
    // Check for Existing Active Subscription
    // ----------------------------------------------
    const activeSubscription = await db.query.subscriptions.findFirst({
        where: and(
            eq(subscriptions.userId, session.user.id),
            eq(subscriptions.status, "ACTIVE")
        ),
        with: {
            plan: true, // Needed for installment metadata
        },
    });

    let isNextInstallment = false;
    let currentInstallmentIndex = 1;

    if (activeSubscription) {
        // A. Prevent plan switching while active
        if (activeSubscription.planId !== planId) {
            return {
                error:
                    "You already have an active membership. You cannot switch plans while your current subscription is active.",
            };
        }

        // Safe defaults for nullable fields
        const currentPaid = activeSubscription.installmentsPaid || 0;
        const maxInstallments =
            activeSubscription.plan.totalInstallments || 1;

        // B. Allow next installment payment
        if (currentPaid < maxInstallments) {
            isNextInstallment = true;
            currentInstallmentIndex = currentPaid + 1;
        } else {
            // C. Block if already fully paid
            return { error: "You have already fully paid for this plan." };
        }
    }

    // ----------------------------------------------
    // Fetch Target Plan + Batch Metadata
    // ----------------------------------------------
    const plan = await db.query.plans.findFirst({
        where: eq(plans.id, planId),
        with: {
            batch: true,
        },
    });

    if (!plan) return { error: "Invalid Plan." };

    // ----------------------------------------------
    // Batch / Season Validation
    // ----------------------------------------------
    // Prevent purchases for inactive or closed batches
    if (plan.batch.status !== "ACTIVE") {
        return {
            error:
                "This season has ended. New subscriptions are no longer accepted.",
        };
    }

    if (plan.batch.registrationCloseDate) {
        const nowTime = new Date().getTime();
        const closeTime = new Date(
            plan.batch.registrationCloseDate
        ).getTime();

        if (nowTime > closeTime) {
            return { error: "Registration for this season is closed." };
        }
    }

    // ----------------------------------------------
    // Resume Incomplete Purchase Flow
    // ----------------------------------------------
    // Allows users to continue payment if they abandoned checkout earlier
    if (!isNextInstallment) {
        const existingSubForPlan =
            await db.query.subscriptions.findFirst({
                where: and(
                    eq(subscriptions.userId, session.user.id),
                    eq(subscriptions.planId, planId)
                ),
            });

        if (existingSubForPlan) {
            if (
                existingSubForPlan.amountPaid &&
                existingSubForPlan.amountPaid >=
                existingSubForPlan.totalAmount
            ) {
                return {
                    error: "You have already fully paid for this plan.",
                };
            }

            // Resume installment index
            currentInstallmentIndex =
                (existingSubForPlan.installmentsPaid || 0) + 1;
        }
    }

    // ----------------------------------------------
    // Calculate Payable Amount
    // ----------------------------------------------
    let amountToPay = plan.price;
    let isInstallmentMode = false;

    // Installment logic
    if (
        isNextInstallment ||
        (paymentMode === "INSTALLMENT" &&
            plan.allowInstallments &&
            (plan.totalInstallments || 0) > 1)
    ) {
        amountToPay = Math.floor(
            plan.price / (plan.totalInstallments || 1)
        );
        isInstallmentMode = true;
    } else {
        // Full payment discount logic
        if (plan.fullPaymentDiscount && plan.fullPaymentDiscount > 0) {
            const discountAmount = Math.floor(
                (plan.price * plan.fullPaymentDiscount) / 100
            );
            amountToPay = plan.price - discountAmount;
        }
    }

    // ----------------------------------------------
    // Create Razorpay Order
    // ----------------------------------------------
    try {
        const order = await razorpay.orders.create({
            amount: amountToPay, // Amount in paise
            currency: "INR",
            receipt: `rect_${session.user.id.substring(
                0,
                10
            )}_${Date.now()}`,
            notes: {
                planId: plan.id,
                userId: session.user.id,
                isInstallment: String(isInstallmentMode),
                paymentMode: paymentMode,
                installmentIndex: String(currentInstallmentIndex),
            },
        });

        if (!order) throw new Error("Razorpay API Error");

        // Persist payment intent before capture
        await db.insert(payments).values({
            userId: session.user.id,
            razorpayOrderId: order.id,
            amount: amountToPay,
            status: "created",
            installmentIndex: currentInstallmentIndex,
        });

        return {
            data: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                description: isInstallmentMode
                    ? `Installment ${currentInstallmentIndex} of ${plan.totalInstallments}`
                    : `Full Payment (Inc. ${plan.fullPaymentDiscount}% Discount)`,
            },
        };
    } catch (error) {
        console.error("Order Creation Error:", error);
        return {
            error: "Failed to initiate payment. Please try again.",
        };
    }
}

// ------------------------------------------------------------------
// 2. CANCEL SUBSCRIPTION (WITH REFUND)
// ------------------------------------------------------------------
// - Allowed only within first 7 days
// - Attempts Razorpay refund
// - Falls back gracefully if payment record is missing
export async function cancelSubscription() {
    // ----------------------------------------------
    // Authentication Guard
    // ----------------------------------------------
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized." };

    // ----------------------------------------------
    // Fetch Active Subscription
    // ----------------------------------------------
    const sub = await db.query.subscriptions.findFirst({
        where: and(
            eq(subscriptions.userId, session.user.id),
            eq(subscriptions.status, "ACTIVE")
        ),
    });

    if (!sub) return { error: "No active subscription found." };
    if (!sub.startDate)
        return { error: "Invalid subscription start date." };

    // ----------------------------------------------
    // Cancellation Window Check (7 days)
    // ----------------------------------------------
    const daysActive = getDaysDifference(new Date(), sub.startDate);

    if (daysActive > 7) {
        return {
            error: `Cancellation period expired. You can only cancel within the first 7 days. It has been ${daysActive} days.`,
        };
    }

    try {
        // ----------------------------------------------
        // Fetch Most Recent Captured Payment
        // ----------------------------------------------
        const lastPayment = await db.query.payments.findFirst({
            where: and(
                eq(payments.userId, session.user.id),
                eq(payments.status, "captured")
            ),
            orderBy: [desc(payments.createdAt)],
        });

        // Fallback: No payment found → cancel without refund
        if (!lastPayment || !lastPayment.razorpayPaymentId) {
            await db
                .update(subscriptions)
                .set({ status: "CANCELED", endDate: new Date() })
                .where(eq(subscriptions.id, sub.id));

            return {
                success: true,
                message:
                    "Subscription canceled (No payment found to refund).",
            };
        }

        // ----------------------------------------------
        // Initiate Razorpay Refund
        // ----------------------------------------------
        const refund = await razorpay.payments.refund(
            lastPayment.razorpayPaymentId,
            {
                speed: "normal",
                notes: {
                    reason: "User requested cancellation within 7 days",
                    subscriptionId: sub.id,
                },
            }
        );

        let dbStatus:
            | "REFUNDED"
            | "REFUND_PROCESSING"
            | "CANCELED" = "CANCELED";

        let paymentStatus = "captured";

        // Map Razorpay refund status to DB states
        if (refund.status === "processed") {
            dbStatus = "REFUNDED";
            paymentStatus = "refunded";
        } else if (refund.status === "pending") {
            dbStatus = "REFUND_PROCESSING";
            paymentStatus = "refund_pending";
        }

        // ----------------------------------------------
        // Persist Subscription State
        // ----------------------------------------------
        await db
            .update(subscriptions)
            .set({
                status: dbStatus,
                endDate: new Date(),
            })
            .where(eq(subscriptions.id, sub.id));

        // ----------------------------------------------
        // Update Payment History Status
        // ----------------------------------------------
        if (
            paymentStatus === "refunded" ||
            paymentStatus === "refund_pending"
        ) {
            await db
                .update(payments)
                .set({ status: paymentStatus })
                .where(eq(payments.id, lastPayment.id));
        }

        // ----------------------------------------------
        // Cache Revalidation
        // ----------------------------------------------
        revalidatePath("/dashboard");
        revalidatePath("/pricing");
        revalidatePath("/subscriptions");

        return {
            success: true,
            message:
                refund.status === "processed"
                    ? "Success! Refund initiated and processed instantly."
                    : "Cancellation successful. Refund is processing (5-7 days).",
        };
    } catch (error: any) {
        console.error("Refund Error:", error);
        return {
            error:
                error?.error?.description ||
                "Failed to process refund with payment gateway.",
        };
    }
}
