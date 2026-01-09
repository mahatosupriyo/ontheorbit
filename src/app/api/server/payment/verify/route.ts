/**
 * Payment Verification Endpoint
 * -----------------------------
 * Verifies Razorpay payment signature after checkout success
 * and updates:
 * - Payments table (captured state)
 * - Subscriptions table (create or extend)
 *
 * This endpoint is called after a successful Razorpay payment
 * from the client side.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto"; // Used for Razorpay signature verification
import { db } from "@/server/db"; // Database client
import { payments, subscriptions, plans } from "@/server/db/schema/commerce";
import { eq, and } from "drizzle-orm"; // Query helpers
import { auth } from "@/auth"; // Auth.js session helper

export async function POST(req: NextRequest) {
    try {
        // --------------------------------------------------
        // 0. Authentication Guard
        // --------------------------------------------------
        // Ensures the payment verification is tied to a logged-in user
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // --------------------------------------------------
        // Parse Request Payload
        // --------------------------------------------------
        const body = await req.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            planId,
        } = body;

        // --------------------------------------------------
        // 1. Verify Razorpay Signature
        // --------------------------------------------------
        /**
         * Razorpay signs the payment using:
         * HMAC_SHA256(order_id | payment_id, key_secret)
         *
         * This ensures the payment response was not tampered with.
         */
        const bodyData =
            razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET!
            )
            .update(bodyData.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            // Signature mismatch → reject payment
            return NextResponse.json(
                { success: false, message: "Invalid Signature" },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 2. Fetch Payment Record (Order must exist)
        // --------------------------------------------------
        const paymentRecord =
            await db.query.payments.findFirst({
                where: eq(
                    payments.razorpayOrderId,
                    razorpay_order_id
                ),
            });

        if (!paymentRecord) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 }
            );
        }

        // --------------------------------------------------
        // 3. Fetch Plan Metadata
        // --------------------------------------------------
        const plan = await db.query.plans.findFirst({
            where: eq(plans.id, planId),
        });

        if (!plan) {
            return NextResponse.json(
                { success: false, message: "Plan not found" },
                { status: 404 }
            );
        }

        // --------------------------------------------------
        // 4. Subscription Resolution Logic
        // --------------------------------------------------
        /**
         * We resolve subscription by:
         * - userId
         * - planId
         *
         * This allows multiple seasons/batches to coexist
         * as separate subscriptions.
         */
        let subscription =
            await db.query.subscriptions.findFirst({
                where: and(
                    eq(subscriptions.userId, session.user.id),
                    eq(subscriptions.planId, planId)
                ),
            });

        const now = new Date();

        // Compute new end date based on plan validity
        const endDate = new Date();
        endDate.setDate(
            now.getDate() + (plan.validityDays || 365)
        );

        if (!subscription) {
            // ----------------------------------------------
            // A. Create NEW Subscription (First Payment)
            // ----------------------------------------------
            const [newSub] = await db
                .insert(subscriptions)
                .values({
                    userId: session.user.id,
                    planId: plan.id,
                    status: "ACTIVE", // Active immediately on first payment
                    startDate: now,
                    endDate: endDate,
                    totalAmount: plan.price,
                    amountPaid: paymentRecord.amount,
                    installmentsPaid: 1,
                })
                .returning();

            subscription = newSub;
        } else {
            // ----------------------------------------------
            // B. Update EXISTING Subscription (Installment)
            // ----------------------------------------------
            const newAmountPaid =
                (subscription.amountPaid || 0) +
                paymentRecord.amount;

            const newInstallmentsPaid =
                (subscription.installmentsPaid || 0) + 1;

            /**
             * Status is set back to ACTIVE because a payment
             * was successfully captured.
             *
             * Time-based states (OVERDUE, PAST_DUE, etc.)
             * should be handled separately by cron jobs,
             * not during payment confirmation.
             */
            await db
                .update(subscriptions)
                .set({
                    status: "ACTIVE",
                    amountPaid: newAmountPaid,
                    installmentsPaid: newInstallmentsPaid,
                    endDate: endDate, // Extend validity window
                })
                .where(eq(subscriptions.id, subscription.id));
        }

        // --------------------------------------------------
        // 5. Update Payment Record
        // --------------------------------------------------
        /**
         * Mark payment as captured and link it
         * to the resolved subscription.
         */
        await db
            .update(payments)
            .set({
                razorpayPaymentId: razorpay_payment_id,
                status: "captured",
                subscriptionId: subscription.id,
            })
            .where(eq(payments.id, paymentRecord.id));

        // --------------------------------------------------
        // Final Success Response
        // --------------------------------------------------
        return NextResponse.json({ success: true });

    } catch (error) {
        // Catch-all for unexpected failures
        console.error("Payment Verification Error", error);

        return NextResponse.json(
            { success: false, message: "Internal Error" },
            { status: 500 }
        );
    }
}
