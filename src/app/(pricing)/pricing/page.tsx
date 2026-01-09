import { db } from "@/server/db";
import { auth } from "@/auth";
import { plans, batches } from "@/server/db/schema/commerce";
import { PricingCard } from "../pricingcomponents/pricingcard"; // Your PricingCard component
import CreatePlanForm from "../pricingcomponents/admin/createplanform"; 
import CreateSeasonForm from '../pricingcomponents/admin/seasonlaunchwizard'
import EditPlanModal from "../pricingcomponents/editplan";
import StartNewSeasonModal from "../pricingcomponents/admin/seasonlaunchwizard";
import styles from "../pricingcomponents/pricing.module.scss";
import { eq, desc } from "drizzle-orm";

export const metadata = {
  title: "Membership Plans | On The Orbit",
};

interface GroupedBatch {
  id: string;
  name: string;
  status: "ACTIVE" | "ARCHIVED" | "DRAFT";
  startDate: Date | null;
  plans: typeof plans.$inferSelect[];
}

export default async function PricingPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN"; 

  // 1. Fetch Plans with Batch Relation
  const allPlans = await db.query.plans.findMany({
    // Public: Sees ONLY active plans. Admin: Sees ALL.
    where: isAdmin ? undefined : eq(plans.isActive, true),
    orderBy: [desc(plans.createdAt)], 
    with: { batch: true } 
  });

  // 2. Fetch Active Batch (for Admin Header controls)
  const activeBatch = await db.query.batches.findFirst({
    where: eq(batches.status, "ACTIVE"),
  });

  // 3. Group Plans by Season (Batch)
  const groupedSeasons: Record<string, GroupedBatch> = {};

  allPlans.forEach((plan) => {
    // If public user, skip plans belonging to archived batches (double safety)
    if (!isAdmin && plan.batch?.status !== "ACTIVE") return;

    const batchId = plan.batchId;
    if (!groupedSeasons[batchId]) {
      groupedSeasons[batchId] = {
        id: plan.batch!.id,
        name: plan.batch!.name,
        status: plan.batch!.status as "ACTIVE" | "ARCHIVED",
        startDate: plan.batch!.startDate,
        plans: []
      };
    }
    groupedSeasons[batchId].plans.push(plan);
  });

  // 4. Sort Seasons: Active First, then by Date
  const sortedBatches = Object.values(groupedSeasons).sort((a, b) => {
    if (a.status === "ACTIVE") return -1;
    if (b.status === "ACTIVE") return 1;
    return new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime();
  });

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Choose your trajectory</h1>
        <p className={styles.pageSubtitle}>
          Unlock exclusive resources, community access, and tools.
        </p>
      </div>

      {/* --- ADMIN ZONE --- */}
      {isAdmin && (
        <div className={styles.adminZone}>
            <div className={styles.adminHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={styles.adminBadge}>Admin Mode</span>
                </div>
                {activeBatch && <StartNewSeasonModal />}
            </div>
            
            {!activeBatch ? (
                <CreateSeasonForm />
            ) : (
                <>
                    <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>Add Plan to {activeBatch.name}</h3>
                    <CreatePlanForm />
                </>
            )}
        </div>
      )}

      {/* --- SEASON GROUPS --- */}
      <div className={styles.seasonWrapper}>
        {sortedBatches.map((batch) => (
            <div key={batch.id} className={styles.seasonSection}>
                
                {/* Season Header (Visible if there are multiple seasons or for Admins) */}
                <div className={styles.seasonTitleRow}>
                    <h2 className={styles.seasonName}>{batch.name}</h2>
                    {batch.status === "ACTIVE" ? (
                        <span className={styles.activeTag}>● LIVE</span>
                    ) : (
                        <span className={styles.archivedTag}>ARCHIVED</span>
                    )}
                </div>

                {/* Plans Grid */}
                <div className={styles.grid}>
                    {batch.plans.map((plan) => {
                        // Determine if visual "Disabled" style is needed
                        const isArchived = !plan.isActive || batch.status !== "ACTIVE";
                        
                        return (
                            <div key={plan.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                                
                                {/* WRAPPER FOR STYLING:
                                    If archived, applying opacity and disabling pointer events 
                                    prevent users from interacting with the PricingCard (Buy buttons).
                                */}
                                <div style={{ 
                                    flex: 1,
                                    opacity: isArchived ? 0.5 : 1,
                                    filter: isArchived ? 'grayscale(100%)' : 'none',
                                    pointerEvents: isArchived ? 'none' : 'auto', // Disables cursor/clicks
                                    cursor: isArchived ? 'not-allowed' : 'default',
                                    transition: 'all 0.3s'
                                }}>
                                    <PricingCard plan={plan} />
                                </div>

                                {/* ADMIN CONTROLS:
                                    Rendered outside the disabled wrapper so Admin can still edit.
                                */}
                                {isAdmin && (
                                    <div style={{ marginTop: '0px' }}>
                                        <EditPlanModal plan={plan} />
                                        
                                        {isArchived && (
                                            <div style={{ 
                                                textAlign: 'center', color: '#ef4444', 
                                                marginTop: '8px', fontSize: '0.8rem', 
                                                fontWeight: 600, textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                [Archived]
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        ))}
        
        {sortedBatches.length === 0 && (
             <div style={{ textAlign: 'center', padding: '40px', color: '#71717a' }}>
                No active plans available at the moment.
             </div>
        )}
      </div>
    </div>
  );
}