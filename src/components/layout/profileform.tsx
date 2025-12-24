"use client";

import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { TextArea } from "@/components/ui/textarea/textarea";
import styles from "@/components/layout/profileform.module.scss";

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

import { COUNTRIES } from "@/server/db/lib/countries";
import { MONTHS } from "@/server/db/lib/months";
import { GENDERS } from "@/server/db/lib/genders";

import { RadioGroup } from "@/components/ui/radiogroup/radiogroup";
import { Select } from "@/components/ui/select/select";

interface ProfileFormProps {
    user: any;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ user }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // ------------------------------------------------------------------
    // 1. DATA NORMALIZATION
    // ------------------------------------------------------------------
    const getInitialDob = (date?: Date | null) => {
        if (!date) return { day: "", month: "", year: "" };
        const d = new Date(date);
        return {
            day: d.getUTCDate().toString(),
            month: d.getUTCMonth().toString(),
            year: d.getUTCFullYear().toString(),
        };
    };

    const getNormalizedUser = (u: any) => ({
        name: u.name || "",
        username: u.username || "",
        about: u.about || "",
        portfolioUrl: u.portfolioUrl || "",
        phoneNumber: u.phoneNumber || "",
        country: u.country || "",
        gender: u.gender || "",
        dob: getInitialDob(u.dateOfBirth),
    });

    // ------------------------------------------------------------------
    // 2. STATE MANAGEMENT
    // ------------------------------------------------------------------
    const [initialData, setInitialData] = useState(getNormalizedUser(user));

    const [formData, setFormData] = useState({
        name: initialData.name,
        username: initialData.username,
        about: initialData.about,
        portfolioUrl: initialData.portfolioUrl,
        phoneNumber: initialData.phoneNumber,
        country: initialData.country,
    });

    const [gender, setGender] = useState(initialData.gender);
    const [dob, setDob] = useState(initialData.dob);

    useEffect(() => {
        const newData = getNormalizedUser(user);
        setInitialData(newData);
        setFormData({
            name: newData.name,
            username: newData.username,
            about: newData.about,
            portfolioUrl: newData.portfolioUrl,
            phoneNumber: newData.phoneNumber,
            country: newData.country,
        });
        setGender(newData.gender);
        setDob(newData.dob);
    }, [user]);

    // ------------------------------------------------------------------
    // 3. VALIDATION LOGIC
    // ------------------------------------------------------------------
    const errors = useMemo(() => {
        const errs: Record<string, boolean> = {};

        // Username: Alphabets only
        if (formData.username && !/^[a-zA-Z]+$/.test(formData.username)) {
            errs.username = true;
        }

        // Phone: Numbers only, 10-15 digits
        if (formData.phoneNumber) {
            const cleanPhone = formData.phoneNumber.replace(/\D/g, '');
            if (cleanPhone.length < 10 || cleanPhone.length > 15 || !/^\+?[0-9]*$/.test(formData.phoneNumber)) {
                errs.phoneNumber = true;
            }
        }

        // Birthday Logic
        const currentYear = new Date().getFullYear();
        const day = parseInt(dob.day);
        const year = parseInt(dob.year);

        if (dob.day && (isNaN(day) || day < 1 || day > 31)) errs.dobDay = true;
        if (dob.year) {
            if (isNaN(year) || year < 1950) errs.dobYear = true;
            if (currentYear - year < 13) errs.dobYear = true;
        }

        return errs;
    }, [formData, dob]);

    const hasErrors = Object.keys(errors).length > 0;

    // ------------------------------------------------------------------
    // 4. DIRTY CHECKING
    // ------------------------------------------------------------------
    const isDirty = useMemo(() => {
        if (formData.name !== initialData.name) return true;
        if (formData.username !== initialData.username) return true;
        if (formData.about !== initialData.about) return true;
        if (formData.portfolioUrl !== initialData.portfolioUrl) return true;
        if (formData.phoneNumber !== initialData.phoneNumber) return true;
        if (formData.country !== initialData.country) return true;
        if (gender !== initialData.gender) return true;

        if (dob.day !== initialData.dob.day ||
            dob.month !== initialData.dob.month ||
            dob.year !== initialData.dob.year) return true;

        return false;
    }, [formData, gender, dob, initialData]);


    const resetFormToOriginal = () => {
        setFormData({
            name: initialData.name,
            username: initialData.username,
            about: initialData.about,
            portfolioUrl: initialData.portfolioUrl,
            phoneNumber: initialData.phoneNumber,
            country: initialData.country,
        });
        setGender(initialData.gender);
        setDob(initialData.dob);
    };

    // ------------------------------------------------------------------
    // 5. HANDLERS
    // ------------------------------------------------------------------
    const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleDobChange = (field: string, value: string) => setDob(prev => ({ ...prev, [field]: value }));

    // SAVE HANDLER
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (hasErrors || !isDirty) return;

        setIsLoading(true);
        const toastId = toast.loading("Saving changes");

        const payload = { ...formData, gender, dob };

        try {
            const res = await fetch("/api/server/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Account updated successfully", { id: toastId });
                router.refresh();
                // Note: The useEffect on [user] will handle updating 
                // initialData to the new values automatically after refresh.
            } else {
                // --- ERROR CASE 1: API Rejected (e.g., Rate limit, Validation) ---
                toast.error(data.error || "Failed to save changes", { id: toastId });

                // RESET FORM HERE
                resetFormToOriginal();
            }
        } catch (err) {
            console.error(err);
            // --- ERROR CASE 2: Network/Server Crash ---
            toast.error("Something went wrong. Please try again.", { id: toastId });

            // RESET FORM HERE
            resetFormToOriginal();
        } finally {
            setIsLoading(false);
        }
    };


    const monthOptions = MONTHS.reduce((acc: any, curr: any) => {
        acc[curr.value] = curr.label;
        return acc;
    }, {});

    return (
        <>
            <form id="profile-form" onSubmit={handleSubmit}>
                <Input
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    maxLength={50}
                />

                <Input
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    fullWidth
                    maxLength={20}
                    style={{ textTransform: 'lowercase' }}
                    helperText={formData.username ? `www.ontheorbit.com/${formData.username}` : "www.ontheorbit.com/username"}
                    error={errors.username}
                />

                <Input
                    label="Portfolio"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    placeholder="https://"
                    fullWidth
                    helperText="Add a link to drive traffic to your site"
                />

                <Input
                    label="Phone number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    helperText="For contact purposes only, we won't spam you."
                    fullWidth
                    maxLength={12}
                    error={errors.phoneNumber}
                />

                <TextArea
                    label="TL;DR"
                    name="about"
                    value={formData.about}
                    onChange={handleChange}
                    fullWidth
                    maxLength={500}
                    placeholder="Tell about yourself"
                />

                <Input
                    label="Email address"
                    value={user.email || ""}
                    disabled
                    fullWidth
                />

                <Select
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    options={COUNTRIES}
                    fullWidth
                />

                <div>
                    <RadioGroup
                        label="Gender"
                        name="gender"
                        options={GENDERS}
                        value={gender}
                        onChange={setGender}
                    />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '1rem', marginLeft: '1.4rem', fontWeight: 600, color: '#71717a', display: 'block', marginBottom: '1rem' }}>
                        Birthday
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '16px' }}>
                        <Input
                            label="Date"
                            value={dob.day}
                            onChange={(e) => handleDobChange("day", e.target.value)}
                            type="number"
                            placeholder="DD"
                            maxLength={2}
                            error={errors.dobDay}
                        />
                        <Select
                            label="Month"
                            value={dob.month}
                            onChange={(e) => handleDobChange("month", e.target.value)}
                            options={monthOptions}
                        />
                        <Input
                            label="Year"
                            value={dob.year}
                            placeholder="YYYY"
                            onChange={(e) => handleDobChange("year", e.target.value)}
                            type="number"
                            maxLength={4}
                            error={errors.dobYear}
                        />
                    </div>
                </div>
            </form>

            <div style={{
                display: 'inline-flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                gap: '1.4rem', margin: '4rem 1.4rem', marginBottom: '12rem',
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                    <p style={{ fontSize: '1rem', fontWeight: 600, color: '#950606' }}>Danger zone</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <h3 style={{ fontSize: '1.6rem', fontWeight: 600, color: '#fff' }}>Delete your data and account</h3>
                        <p style={{ fontSize: '1.2rem', fontWeight: 500, color: '#71717a' }}>
                            Permanently delete your data and everything associated with your account.
                        </p>
                    </div>
                </div>
                <div>
                    <Button
                        type="button"
                        style={{
                            textWrap: 'nowrap',
                            background: '#950606',
                            display: "block",
                        }}
                    >
                        {"Delete account"}
                    </Button>
                </div>
            </div>

            <div className={styles.fixedSaveBar}>
                <div className={styles.saveContent}>
                    <div className={styles.status}></div>
                    <div className={styles.buttons}>
                        <Button
                            type="submit"
                            variant="secondary"
                            form="profile-form"
                            disabled={isLoading || !isDirty || hasErrors}
                            style={{
                                opacity: (!isDirty) ? 0.5 : 1,
                                cursor: (!isDirty) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isLoading ? "Saving" : "Save changes"}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};