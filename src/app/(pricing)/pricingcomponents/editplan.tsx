"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updatePlan } from "@/server/actions/admin/commerce"; // Ensure this path is correct
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { TextArea } from "@/components/ui/textarea/textarea";
import styles from "./pricing.module.scss";

interface PlanData {
  id: string;
  title: string;
  description: string | null;
  price: number;
  // season: string | null;  <-- REMOVED: Managed via Batch ID
  isActive: boolean | null;
  features: string[] | null;
  validityDays: number | null;
  allowInstallments: boolean | null;
  totalInstallments: number | null;
  fullPaymentDiscount: number | null;
}

export default function EditPlanModal({ plan }: { plan: PlanData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allowInstallments, setAllowInstallments] = useState(plan.allowInstallments || false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const toastId = toast.loading("Updating plan...");

    const res = await updatePlan(plan.id, formData);

    if (res.success) {
      toast.success("Plan updated successfully", { id: toastId });
      setIsOpen(false);
      router.refresh();
    } else {
      toast.error(res.error || "Update failed", { id: toastId });
    }
    setIsLoading(false);
  };

  return (
    <>
      <Button 
        variant="secondary" 
        onClick={() => setIsOpen(true)}
        style={{ 
            marginTop: '12px', width: '100%', background: 'transparent', 
            border: '1px solid #3f3f46', color: '#a1a1aa' 
        }}
      >
        Edit Plan
      </Button>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.header}>
                <h3>Edit {plan.title}</h3>
                <button type="button" onClick={() => setIsOpen(false)} className={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleUpdate} className={styles.form}>
                
                {/* 1. BASIC INFO */}
                <div className={styles.sectionTitle}>Basic Info</div>
                <Input label="Title" name="title" defaultValue={plan.title} fullWidth />
                <TextArea label="Description" name="description" defaultValue={plan.description || ""} fullWidth />
                
                <div className={styles.row}>
                    <Input label="Price (INR)" name="price" type="number" defaultValue={plan.price / 100} fullWidth />
                    <Input label="Validity (Days)" name="validityDays" type="number" defaultValue={plan.validityDays || 365} fullWidth />
                </div>

                {/* 2. FEATURES */}
                <div className={styles.sectionTitle} style={{ marginTop: '10px' }}>Features</div>
                <TextArea 
                    label="Features (One per line)" 
                    name="features" 
                    defaultValue={plan.features?.join("\n")} 
                    rows={5} 
                    fullWidth 
                />

                {/* 3. INSTALLMENTS & DISCOUNTS */}
                <div className={styles.sectionTitle} style={{ marginTop: '10px' }}>Payment Logic</div>
                
                {/* Full Payment Discount */}
                <Input 
                    label="Full Payment Discount (%)" 
                    name="fullPaymentDiscount" 
                    type="number" 
                    defaultValue={plan.fullPaymentDiscount || 0}
                    min={0} max={100} 
                    fullWidth 
                />

                {/* Installment Toggle Block */}
                <div className={styles.toggleBlock}>
                    <div className={styles.toggleRow}>
                        <label className={styles.label}>Enable Installments</label>
                        <label className={styles.switch}>
                            <input 
                                type="checkbox" 
                                name="allowInstallments" 
                                checked={allowInstallments}
                                onChange={(e) => setAllowInstallments(e.target.checked)} 
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                    {allowInstallments && (
                         <div style={{ marginTop: '12px', animation: 'fadeIn 0.2s' }}>
                            <Input 
                                label="Total Installments" 
                                name="totalInstallments" 
                                type="number" 
                                defaultValue={plan.totalInstallments || 2} 
                                min={2} 
                                fullWidth 
                            />
                         </div>
                    )}
                </div>

                {/* 4. VISIBILITY */}
                <div className={styles.toggleRow} style={{ marginTop: '10px', borderColor: '#22c55e' }}>
                    <label className={styles.label} style={{ color: '#fff', fontWeight: 600 }}>Is Active (Visible to Public)</label>
                    <label className={styles.switch}>
                        <input type="checkbox" name="isActive" defaultChecked={plan.isActive ?? true} />
                        <span className={styles.slider} style={{ backgroundColor: '#3f3f46' }}></span>
                    </label>
                </div>

                <div className={styles.actions}>
                    <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={isLoading} style={{ background: '#E50914', color: '#fff' }}>
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}