"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateSeason } from "@/server/actions/admin/commerce";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import styles from "./wizard.module.scss"; // Reusing wizard styles

interface SeasonData {
    id: string;
    name: string;
    registrationCloseDate: Date | null;
}

export default function EditSeasonModal({ season }: { season: SeasonData }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Helper to format Date object to "YYYY-MM-DDTHH:mm" for input
    const formatDateForInput = (date: Date | null) => {
        if (!date) return "";
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        const res = await updateSeason(season.id, formData);

        if (res.success) {
            toast.success("Season details updated");
            setIsOpen(false);
            router.refresh();
        } else {
            toast.error(res.error || "Update failed");
        }
        setIsLoading(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}
            >
                Edit Details
            </button>
        );
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.wizardModal} style={{ width: '400px' }}>
                <div className={styles.header}>
                    <h3>Edit Season Details</h3>
                    <button type="button" onClick={() => setIsOpen(false)} className={styles.closeBtn}>✕</button>
                </div>

                <form onSubmit={handleUpdate} className={styles.stepContent}>
                    <div style={{ marginBottom: '16px' }}>
                        <Input
                            label="Season Name"
                            name="name"
                            defaultValue={season.name}
                            required
                            fullWidth
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ color: '#a1a1aa', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>
                            Registration Deadline
                        </label>
                        <input
                            type="datetime-local"
                            name="registrationCloseDate"
                            className={styles.dateInput}
                            defaultValue={formatDateForInput(season.registrationCloseDate)}
                        />
                        <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#71717a' }}>
                            Clear this field to reopen registration indefinitely.
                        </div>
                    </div>

                    <div className={styles.navButtons}>
                        <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}