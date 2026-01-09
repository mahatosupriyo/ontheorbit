"use server";

import { db } from "@/server/db";
import { batches, plans, subscriptions } from "@/server/db/schema/commerce";
import { auth } from "@/auth";
import { eq, count, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- SCHEMAS ---
const PlanInputSchema = z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    price: z.number().min(1),
    validityDays: z.number().default(365),
    features: z.array(z.string()),
    fullPaymentDiscount: z.number().optional().default(0),
    allowInstallments: z.boolean().default(false),
    totalInstallments: z.number().default(1),
});

const LaunchSeasonSchema = z.object({
    seasonName: z.string().min(2),
    registrationCloseDate: z.date().optional(), // Nullable for "Open Indefinitely"
    plans: z.array(PlanInputSchema).min(1, "At least one plan is required"),
});


// --------------------------------------------------------------------------
// 1. UNIFIED LAUNCH WIZARD (Archives old season, Creates new one + Plans)
// --------------------------------------------------------------------------
export async function launchSeasonWithPlans(rawData: any) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

    const validation = LaunchSeasonSchema.safeParse(rawData);
    if (!validation.success) return { error: validation.error.issues[0].message };

    const { seasonName, registrationCloseDate, plans: newPlans } = validation.data;

    try {
        await db.transaction(async (tx) => {
            // A. Archive ALL currently active batches
            await tx.update(batches)
                .set({ status: "ARCHIVED", endDate: new Date() })
                .where(eq(batches.status, "ACTIVE"));

            // B. Create NEW Batch
            const [newBatch] = await tx.insert(batches).values({
                name: seasonName,
                status: "ACTIVE",
                startDate: new Date(),
                registrationCloseDate: registrationCloseDate || null,
            }).returning();

            // C. Create Plans linked to this Batch
            for (const plan of newPlans) {
                let finalInstallments = 1;
                if (plan.allowInstallments && plan.totalInstallments > 1) {
                    finalInstallments = plan.totalInstallments;
                }

                await tx.insert(plans).values({
                    batchId: newBatch.id,
                    title: plan.title,
                    description: plan.description || "",
                    price: plan.price * 100, // Convert to paise
                    features: plan.features,
                    validityDays: plan.validityDays,
                    allowInstallments: plan.allowInstallments,
                    totalInstallments: finalInstallments,
                    fullPaymentDiscount: plan.fullPaymentDiscount,
                    isActive: true,
                    createdAt: new Date(),
                });
            }
        });

        revalidatePath("/pricing");
        revalidatePath("/admin/seasons");
        return { success: true };
    } catch (err) {
        console.error("Launch Error:", err);
        return { error: "Failed to launch season. Transaction rolled back." };
    }
}

// --------------------------------------------------------------------------
// 2. DELETE SEASON (Strict Security Check)
// --------------------------------------------------------------------------
export async function deleteBatch(batchId: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

    try {
        // A. Get all plan IDs in this batch
        const batchPlans = await db.query.plans.findMany({
            where: eq(plans.batchId, batchId),
            columns: { id: true }
        });

        const planIds = batchPlans.map(p => p.id);

        if (planIds.length > 0) {
            // B. Check for existing subscriptions
            const subCount = await db
                .select({ count: count() })
                .from(subscriptions)
                .where(inArray(subscriptions.planId, planIds));

            if (subCount[0].count > 0) {
                return { error: "Cannot delete: Users have purchased plans in this season. Please archive it instead." };
            }
        }

        // C. Safe to delete (No financial data linked)
        await db.delete(batches).where(eq(batches.id, batchId));
        revalidatePath("/pricing");
        return { success: true, message: "Season deleted permanently." };
    } catch (err) {
        console.error(err);
        return { error: "Failed to delete season." };
    }
}


// --------------------------------------------------------------------------
// 3. CREATE SINGLE PLAN (For ongoing seasons)
// --------------------------------------------------------------------------
export async function createPlanInActiveBatch(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

    try {
        // Parse Data
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const priceINR = Number(formData.get("price"));
        const validityDays = Number(formData.get("validityDays")) || 365;

        const featuresRaw = formData.get("features") as string;
        const features = featuresRaw ? featuresRaw.split("\n").map(f => f.trim()).filter(f => f !== "") : [];

        const allowInstallments = formData.get("allowInstallments") === "on";
        const totalInstallments = Number(formData.get("totalInstallments")) || 1;
        const fullPaymentDiscount = Number(formData.get("fullPaymentDiscount")) || 0;

        // Find Active Batch
        const activeBatch = await db.query.batches.findFirst({
            where: eq(batches.status, "ACTIVE"),
        });

        if (!activeBatch) return { error: "No active season found. Please launch a season first." };

        // Insert Plan
        await db.insert(plans).values({
            batchId: activeBatch.id,
            title,
            description,
            price: priceINR * 100,
            features,
            validityDays,
            isActive: true,
            allowInstallments,
            totalInstallments: allowInstallments ? totalInstallments : 1,
            fullPaymentDiscount,
            createdAt: new Date(),
        });

        revalidatePath("/pricing");
        return { success: true };
    } catch (err) {
        console.error(err);
        return { error: "Failed to create plan" };
    }
}

// --------------------------------------------------------------------------
// 4. UPDATE PLAN
// --------------------------------------------------------------------------
export async function updatePlan(planId: string, formData: FormData) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const priceINR = Number(formData.get("price"));
        const validityDays = Number(formData.get("validityDays"));

        const featuresRaw = formData.get("features") as string;
        const features = featuresRaw ? featuresRaw.split("\n").map(f => f.trim()).filter(f => f !== "") : [];

        const isActive = formData.get("isActive") === "on";
        const allowInstallments = formData.get("allowInstallments") === "on";
        const totalInstallments = Number(formData.get("totalInstallments")) || 1;
        const fullPaymentDiscount = Number(formData.get("fullPaymentDiscount")) || 0;

        await db.update(plans).set({
            title,
            description,
            price: priceINR * 100,
            validityDays,
            features,
            isActive,
            allowInstallments,
            totalInstallments: allowInstallments ? totalInstallments : 1,
            fullPaymentDiscount,
        }).where(eq(plans.id, planId));

        revalidatePath("/pricing");
        return { success: true };

    } catch (error) {
        console.error("Update Plan Error:", error);
        return { error: "Failed to update plan" };
    }
}

// --------------------------------------------------------------------------
// 5. ARCHIVE/DELETE PLAN (Smart Logic)
// --------------------------------------------------------------------------
export async function deleteOrArchivePlan(planId: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

    try {
        const subCount = await db
            .select({ count: count() })
            .from(subscriptions)
            .where(eq(subscriptions.planId, planId));

        const hasPurchases = subCount[0].count > 0;

        if (hasPurchases) {
            // SOFT DELETE
            await db.update(plans)
                .set({ isActive: false })
                .where(eq(plans.id, planId));
            return { success: true, message: "Plan archived (sales exist)" };
        } else {
            // HARD DELETE
            await db.delete(plans).where(eq(plans.id, planId));
            return { success: true, message: "Plan deleted permanently" };
        }
    } catch (err) {
        return { error: "Operation failed" };
    }
}

export async function updateSeason(batchId: string, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const regDateRaw = formData.get("registrationCloseDate") as string;

    try {
        await db.update(batches)
            .set({
                name,
                // If empty string, set to null (Open Indefinitely), else parse date
                registrationCloseDate: regDateRaw ? new Date(regDateRaw) : null,
            })
            .where(eq(batches.id, batchId));

        revalidatePath("/pricing");
        return { success: true };
    } catch (err) {
        console.error("Update Season Error:", err);
        return { error: "Failed to update season details" };
    }
}