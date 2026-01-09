"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteBatch } from "@/server/actions/admin/commerce";
import SeasonLaunchWizard from "./seasonlaunchwizard"; // The new Wizard
import CreatePlanForm from "./createplanform";
import styles from "./admindashboard.module.scss";
import EditSeasonModal from "./editseason";

// Helper for dates
const formatDate = (date: Date | null | string) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    }).format(new Date(date));
};

export default function AdminPricingDashboard({ activeBatch, allBatches }: { activeBatch: any, allBatches: any[] }) {
    const [activeTab, setActiveTab] = useState<"CURRENT" | "HISTORY">("CURRENT");
    const [showCreatePlan, setShowCreatePlan] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    // DELETE HANDLER
    const handleDeleteSeason = async (batchId: string) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        setIsDeleting(true);
        const res = await deleteBatch(batchId);
        if (res.success) {
            toast.success("Season deleted.");
            router.refresh();
        } else {
            toast.error(res.error);
        }
        setIsDeleting(false);
    };

    // --- EMPTY STATE (First Launch) ---
    if (allBatches.length === 0) {
        return (
            <div className={styles.emptyStateContainer}>
                <div className={styles.emptyContent}>
                    <h2>Welcome to Orbit 🚀</h2>
                    <p>You haven't launched any cohorts yet. Start your first season to begin.</p>
                    <div style={{ marginTop: '20px' }}>
                        <SeasonLaunchWizard />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>

            {/* 1. TOP BAR */}
            <div className={styles.topBar}>
                <div className={styles.tabs}>
                    <button
                        onClick={() => setActiveTab("CURRENT")}
                        className={`${styles.tab} ${activeTab === "CURRENT" ? styles.activeTab : ""}`}
                    >
                        Active Season
                    </button>
                    <button
                        onClick={() => setActiveTab("HISTORY")}
                        className={`${styles.tab} ${activeTab === "HISTORY" ? styles.activeTab : ""}`}
                    >
                        History ({allBatches.length - (activeBatch ? 1 : 0)})
                    </button>
                </div>

                {/* Unified Launch Button (Triggers Next Season) */}
                <div className={styles.actions}>
                    <SeasonLaunchWizard />
                </div>
            </div>

            {/* 2. CONTENT AREA */}
            <div className={styles.contentArea}>

                {/* --- TAB: CURRENT SEASON --- */}
                {activeTab === "CURRENT" && (
                    <>
                        {!activeBatch ? (
                            <div className={styles.archivedState}>
                                <h3>No Active Season</h3>
                                <p>The previous season has ended. Launch a new one to resume sales.</p>
                            </div>
                        ) : (
                            <div className={styles.activeSeasonContainer}>
                                {/* Header Card */}
                                <div className={styles.seasonHeader}>
                                    <div>
                                        <div className={styles.label}>CURRENT COHORT</div>
                                        <h2 className={styles.seasonTitle}>
                                            {activeBatch.name}
                                            <span className={styles.liveBadge}>● LIVE</span>
                                        </h2>
                                        <EditSeasonModal season={activeBatch} />
                                        <div className={styles.metaRow}>
                                            <span>Started: {formatDate(activeBatch.startDate)}</span>
                                            <span className={styles.dot}>•</span>
                                            <span>
                                                Registration:
                                                <strong style={{ color: activeBatch.registrationCloseDate ? '#ef4444' : '#22c55e', marginLeft: '5px' }}>
                                                    {activeBatch.registrationCloseDate
                                                        ? `Closes ${formatDate(activeBatch.registrationCloseDate)}`
                                                        : "Open Indefinitely"}
                                                </strong>
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowCreatePlan(!showCreatePlan)}
                                        className={styles.addPlanBtn}
                                    >
                                        {showCreatePlan ? "Close Form" : "+ Add Single Plan"}
                                    </button>
                                </div>

                                {/* Collapsible Create Form (For adding plans mid-season) */}
                                {showCreatePlan && (
                                    <div className={styles.createFormWrapper}>
                                        <CreatePlanForm />
                                    </div>
                                )}

                                <div className={styles.infoBox}>
                                    ℹ️ <strong>Note:</strong> Plans created here are added immediately to <em>{activeBatch.name}</em>.
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* --- TAB: HISTORY --- */}
                {activeTab === "HISTORY" && (
                    <div className={styles.historyList}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Cohort Name</th>
                                    <th>Duration</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allBatches.filter(b => b.status === "ARCHIVED").map((batch) => (
                                    <tr key={batch.id}>
                                        <td className={styles.nameCol}>{batch.name}</td>
                                        <td>
                                            {formatDate(batch.startDate)} — {formatDate(batch.endDate)}
                                        </td>
                                        <td><span className={styles.archivedBadge}>ARCHIVED</span></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDeleteSeason(batch.id)}
                                                disabled={isDeleting}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {allBatches.filter(b => b.status === "ARCHIVED").length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#52525b' }}>
                                            No history yet. Archive a season to see it here.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}