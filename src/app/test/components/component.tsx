"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cancelSubscription } from "@/server/actions/payment";
import styles from "../test.module.scss";
import { Button } from "@/components/ui/button/button";

export function CancelSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    const confirmCancel = window.confirm(
      "Are you sure? This action is irreversible. You can only cancel if you are within the 7-day guarantee period."
    );
    if (!confirmCancel) return;

    setIsLoading(true);
    const toastId = toast.loading("Processing cancellation");

    const res = await cancelSubscription();

    if (res.success) {
      toast.success(res.message, { id: toastId });
      router.refresh(); 
    } else {
      toast.error(res.error || "Cancellation failed", { id: toastId });
    }

    setIsLoading(false);
  };

  return (
    <Button 
      onClick={handleCancel} 
      disabled={isLoading}
      variant="primary"
      className={styles.cancelBtn}
      style={{textWrap: 'nowrap', borderRadius: '1.6rem', fontWeight: 600}}
    >
      {isLoading ? (
        <>
          Processing
        </>
      ) : (
        "Cancel subscription"
      )}
    </Button>
  );
}