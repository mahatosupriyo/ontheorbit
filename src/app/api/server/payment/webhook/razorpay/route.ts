/**
 * Razorpay Webhook Handler
 * ------------------------
 * Handles asynchronous events sent by Razorpay, such as:
 * - Refund processed
 * - Refund failed
 * - Payment captured
 *
 * IMPORTANT:
 * - Uses raw request body for signature verification
 * - Must always return 200 OK for valid requests to prevent retries
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto"; // Used for HMAC signature verification
import { db } from "@/server/db"; // Database client
import { subscriptions, payments } from "@/server/db/schema/commerce"; // Commerce tables
import { eq } from "drizzle-orm"; // Query helper

export async function POST(req: NextRequest) {
    try {
        // --------------------------------------------------
        // 1. Read Raw Request Body
        // --------------------------------------------------
        // Razorpay requires the *raw* body (not parsed JSON)
        // to correctly validate the webhook signature.
        const body = await req.text();

        // --------------------------------------------------
        // 2. Extract Signature & Secret
        // --------------------------------------------------
        const signature = req.headers.get("x-razorpay-signature");
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Missing credentials → reject immediately
        if (!signature || !secret) {
            return NextResponse.json(
                { error: "Missing signature or secret" },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 3. Verify Webhook Signature (HMAC SHA256)
        // --------------------------------------------------
        /**
         * Razorpay signs the webhook payload using:
         * HMAC_SHA256(secret, raw_body)
         *
         * We compute the same hash and compare.
         */
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");

        if (expectedSignature !== signature) {
            // Signature mismatch → possible spoofed request
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 4. Parse Webhook Payload
        // --------------------------------------------------
        // Safe to parse JSON only *after* signature validation
        const event = JSON.parse(body);
        const { payload } = event;

        // ==================================================
        // EVENT: REFUND PROCESSED (Success)
        // ==================================================
        if (event.event === "refund.processed") {
            const refund = payload.refund.entity;
            const paymentId = refund.payment_id;

            /**
             * We attach `subscriptionId` in refund notes
             * during cancellation.
             *
             * This is the most reliable way to map a refund
             * back to the correct subscription.
             */
            const subscriptionId = refund.notes?.subscriptionId;

            if (subscriptionId) {
                await db
                    .update(subscriptions)
                    .set({
                        status: "REFUNDED",
                        // Optional: store refund.id if schema supports it
                        // refundId: refund.id
                    })
                    .where(eq(subscriptions.id, subscriptionId));

                console.log(
                    `✅ Webhook: Subscription ${subscriptionId} marked as REFUNDED.`
                );
            } else {
                /**
                 * Fallback path:
                 * If notes are missing, one could attempt to
                 * resolve the subscription via paymentId.
                 *
                 * This is less reliable when multiple subscriptions
                 * exist for a user.
                 */
                console.warn(
                    "⚠️ Webhook: Refund processed but no subscriptionId in notes."
                );
            }
        }

        // ==================================================
        // EVENT: REFUND FAILED
        // ==================================================
        else if (event.event === "refund.failed") {
            const refund = payload.refund.entity;
            const subscriptionId = refund.notes?.subscriptionId;

            if (subscriptionId) {
                /**
                 * Refund failed:
                 * - Money was not returned
                 * - Subscription should not be marked REFUNDED
                 *
                 * Depending on business rules, you may:
                 * - Revert to CANCELED
                 * - Introduce a REFUND_FAILED state
                 */
                await db
                    .update(subscriptions)
                    .set({ status: "CANCELED" })
                    .where(eq(subscriptions.id, subscriptionId));

                console.error(
                    `❌ Webhook: Refund failed for Subscription ${subscriptionId}`
                );
            }
        }

        // ==================================================
        // EVENT: PAYMENT CAPTURED
        // ==================================================
        else if (event.event === "payment.captured") {
            /**
             * This acts as a safety net:
             * - Ensures payment state is updated
             * - Useful if frontend success callback never ran
             */
            const payment = payload.payment.entity;

            // Update payment record with final captured status
            await db
                .update(payments)
                .set({
                    status: "captured",
                    razorpayPaymentId: payment.id,
                })
                .where(eq(payments.razorpayOrderId, payment.order_id));

            // Optional:
            // You may also want to activate or extend the subscription here
        }

        // --------------------------------------------------
        // Always acknowledge webhook receipt
        // --------------------------------------------------
        /**
         * Razorpay retries webhooks until it receives 2xx.
         * Returning 200 OK prevents duplicate processing.
         */
        return NextResponse.json({ status: "ok" });

    } catch (error) {
        // Catch-all for unexpected failures
        console.error("Webhook Error:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
