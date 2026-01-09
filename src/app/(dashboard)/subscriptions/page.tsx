import { auth } from "@/auth";
import { db } from "@/server/db";
import { payments } from "@/server/db/schema/commerce";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { checkSubscriptionAccess } from "@/server/utils/permission";
import styles from "./subscriptions.module.scss";
import { SubscriptionHeader } from "./components/subscriptionheader";
import { ProgressSection } from "./components/progresssection";
import { DateGrid } from "./components/dategrid";
import { PaymentHistory } from "./components/paymenthistory";
import { DangerZone } from "./components/dangerzone";
import { toast } from "sonner";

export default async function SubscriptionPage() {
  // 1. Auth Guard
  const session = await auth();
  if (!session?.user) {redirect("/login"), toast('Auth required')};

  // 2. Data Fetching (Parallelized for performance if needed, keeping sequential for simplicity)
  const access = await checkSubscriptionAccess(session.user.id);
  const { status, subscription: sub, nextDueDate } = access;

  const history = await db.query.payments.findMany({
    where: eq(payments.userId, session.user.id),
    orderBy: [desc(payments.createdAt)],
  });

  // 3. Render
  return (
    <div className={styles.layoutGrid}>
      <div /> {/* Left Spacer */}

      <div className={styles.container}>
        <SubscriptionHeader 
          planName={sub ? sub.plan.title : "Free"} 
        />

        <ProgressSection 
          subscription={sub} 
          status={status} 
          nextDueDate={nextDueDate} 
        />

        {sub && (
          <>
            <DateGrid 
              startDate={sub.startDate!} 
              validityDays={sub.plan.validityDays || 0} 
            />
            
            <PaymentHistory history={history} />
            
            <DangerZone />
          </>
        )}
      </div>

      <div /> {/* Right Spacer */}
    </div>
  );
}