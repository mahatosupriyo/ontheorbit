"use client";

import { useEffect, useState } from "react";
import { createRazorpayOrder } from "@/server/actions/payment";
import { useRouter } from "next/navigation";
import { toast } from 'sonner';

import { Button } from "@/components/ui/button/button";

// Define Razorpay types for window
declare global {
    interface Window {
        Razorpay: any;
    }
}

interface BuyNowButtonProps {
    planId: string;
    paymentMode: "FULL" | "INSTALLMENT"; // <--- Added this required prop
    buttonLabel?: string;
}

export function BuyNowButton({ planId, paymentMode, buttonLabel = "Join Now" }: BuyNowButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Load Razorpay Script
    useEffect(() => {
        if (!window.Razorpay) {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const handlePayment = async () => {
        setIsLoading(true);

        // 1. Create Order on Server (Passed paymentMode here to fix the error)
        const { data, error } = await createRazorpayOrder(planId, paymentMode);

        if (error || !data) {
            toast.error(error || "Failed to create order");
            setIsLoading(false);
            return;
        }

        // 2. Open Razorpay Modal
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: data.amount,
            currency: data.currency,
            name: "On The Orbit",
            description: data.description,
            image: "https://www.ontheorbit.com/Essentials/logo.png",
            order_id: data.id,
            handler: async function (response: any) {
                // 3. Verify Payment on Server
                const verifyRes = await fetch("/api/server/payment/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        planId: planId,
                    }),
                });

                const verifyData = await verifyRes.json();

                if (verifyData.success) {
                    toast.success("Welcome aboard! 🚀");
                    router.push("/pricing");
                } else {
                    toast.error("Payment verification failed.");
                }
                setIsLoading(false);
            },
            prefill: {
                // Prefill logic if needed
            },
            theme: {
                color: "#141414",
            },
            modal: {
                ondismiss: () => {
                    setIsLoading(false);
                }
            }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
    };

    return (
        <Button
            disabled={isLoading}
            onClick={handlePayment}
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#fff',
                color: '#141414',
                // width: '100%',
                lineHeight: '100%',
                borderRadius: '1.4rem',
                padding: '1.6rem',
                fontWeight: 600,
                fontSize: '1.4rem',
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
        >
            {isLoading ? "Processing" : buttonLabel}
        </Button>
    );
}