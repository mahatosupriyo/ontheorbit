"use client";

import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { TextArea } from "@/components/ui/textarea/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { createPlanInActiveBatch } from "@/server/actions/admin/commerce";
import { useRouter } from "next/navigation";

export default function CreatePlanForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [allowInstallments, setAllowInstallments] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const toastId = toast.loading("Adding plan to active season...");

        const res = await createPlanInActiveBatch(formData);

        if (res.success) {
            toast.success("Plan added successfully!", { id: toastId });
            (e.target as HTMLFormElement).reset();
            setAllowInstallments(false);
            router.refresh();
        } else {
            toast.error(res.error || "Failed to create plan", { id: toastId });
        }
        setIsLoading(false);
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                background: '#121214',
                border: '1px solid #27272a',
                padding: '24px',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff', margin: 0 }}>Add Single Plan</h3>
                <span style={{ fontSize: '0.75rem', background: '#22c55e', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    LINKED TO ACTIVE SEASON
                </span>
            </div>

            {/* Title */}
            <Input label="Plan Title" name="title" placeholder="e.g. Founder+" required fullWidth />

            {/* Description */}
            <TextArea label="Description" name="description" placeholder="Short summary..." fullWidth />

            {/* Price & Validity Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <Input
                    label="Price (₹)"
                    name="price"
                    type="number"
                    placeholder="50000"
                    required
                />
                <Input
                    label="Validity (Days)"
                    name="validityDays"
                    type="number"
                    defaultValue={365}
                />
            </div>

            {/* Discount Input */}
            <Input
                label="Full Pay Discount (%)"
                name="fullPaymentDiscount"
                type="number"
                placeholder="0"
                min={0}
                max={100}
                helperText="Percentage discount for upfront payment"
                fullWidth
            />

            {/* Features */}
            <TextArea
                label="Features"
                name="features"
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                helperText="Enter each feature on a new line"
                rows={5}
                fullWidth
            />

            {/* Installment Toggle Section */}
            <div style={{
                background: '#09090b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                padding: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 500, color: '#d4d4d8' }}>
                        Enable Installments
                    </label>

                    <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            name="allowInstallments"
                            checked={allowInstallments}
                            onChange={(e) => setAllowInstallments(e.target.checked)}
                            style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: allowInstallments ? '#22c55e' : '#3f3f46',
                            borderRadius: '34px', transition: '0.3s'
                        }}>
                            <span style={{
                                position: 'absolute', content: '""', height: '16px', width: '16px',
                                left: allowInstallments ? '20px' : '3px', bottom: '3px',
                                backgroundColor: 'white', borderRadius: '50%', transition: '0.3s'
                            }} />
                        </span>
                    </label>
                </div>

                {allowInstallments && (
                    <div style={{ marginTop: '12px', animation: 'fadeIn 0.3s ease' }}>
                        <Input
                            label="Total Number of Installments"
                            name="totalInstallments"
                            type="number"
                            placeholder="e.g. 4"
                            min={2}
                            helperText="Price splits equally by this number."
                        />
                    </div>
                )}
            </div>

            <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? "Creating..." : "Add Plan"}
            </Button>

            <style jsx>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(-5px); }
                  to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </form>
    );
}