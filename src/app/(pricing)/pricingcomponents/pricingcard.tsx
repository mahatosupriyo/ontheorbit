"use client";

import { useState } from "react";
import { BuyNowButton } from "@/app/(pricing)/pricingcomponents/admin/buybtn";
import styles from "./pricing.module.scss";

interface PlanProps {
    id: string;
    title: string;
    description: string | null;
    price: number; // in paise
    features: string[] | null;
    allowInstallments: boolean | null;
    totalInstallments: number | null;
    fullPaymentDiscount: number | null;
}

export function PricingCard({ plan }: { plan: PlanProps }) {
    const [viewMode, setViewMode] = useState<"FULL" | "INSTALLMENT">("FULL");

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount / 100);
    };

    // 1. Calculate Full Payment Price (Discounted)
    let fullPrice = plan.price;
    if (plan.fullPaymentDiscount && plan.fullPaymentDiscount > 0) {
        fullPrice = plan.price - Math.floor((plan.price * plan.fullPaymentDiscount) / 100);
    }

    // 2. Calculate Installment Price
    const canInstallment = plan.allowInstallments && (plan.totalInstallments || 0) > 1;
    const installmentPrice = canInstallment
        ? Math.floor(plan.price / (plan.totalInstallments || 1))
        : 0;

    // 3. Determine Display Price
    const displayPrice = (viewMode === "INSTALLMENT" && canInstallment)
        ? formatCurrency(installmentPrice)
        : formatCurrency(fullPrice);

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>{plan.title}</h3>
                <p className={styles.description}>{plan.description}</p>
            </div>

            {/* Toggle Switch */}
            {canInstallment && (
                <div className={styles.toggleContainer}>
                    <button
                        onClick={() => setViewMode("FULL")}
                        className={`${styles.toggleBtn} ${viewMode === "FULL" ? styles.active : ""}`}
                    >
                        Pay Full 
                        {plan.fullPaymentDiscount && plan.fullPaymentDiscount > 0 && (
                            <span className={styles.discountBadge}>{plan.fullPaymentDiscount}% OFF</span>
                        )}
                    </button>
                    <button
                        onClick={() => setViewMode("INSTALLMENT")}
                        className={`${styles.toggleBtn} ${viewMode === "INSTALLMENT" ? styles.active : ""}`}
                    >
                        Pay via EMI
                    </button>
                </div>
            )}

            <div className={styles.priceContainer}>
                {/* --- ORIGINAL PRICE (SLICED) --- */}
                {viewMode === "FULL" && plan.fullPaymentDiscount && plan.fullPaymentDiscount > 0 && (
                    <div className={styles.originalPrice}>
                        {formatCurrency(plan.price)}
                    </div>
                )}

                {/* --- CURRENT DISPLAY PRICE --- */}
                <span className={styles.price}>{displayPrice}</span>
                
                {/* Period / Details */}
                {viewMode === "INSTALLMENT" && canInstallment ? (
                    <span className={styles.period}>
                        / installment <br />
                        <span className={styles.subtext}>
                            (Total {plan.totalInstallments} payments)
                        </span>
                    </span>
                ) : (
                    <span className={styles.period}>/ one-time</span>
                )}
            </div>

            <ul className={styles.features}>
                {plan.features?.map((feature, i) => (
                    <li key={i} className={styles.featureItem}>
                        <span className={styles.checkIcon}>✓</span>
                        {feature}
                    </li>
                ))}
            </ul>

            <div className={styles.action}>
                <BuyNowButton
                    planId={plan.id}
                    paymentMode={canInstallment ? viewMode : "FULL"}
                    buttonLabel={
                        (canInstallment && viewMode === "INSTALLMENT") 
                            ? "Pay First Installment" 
                            : "Join Now"
                    }
                />
            </div>
        </div>
    );
}