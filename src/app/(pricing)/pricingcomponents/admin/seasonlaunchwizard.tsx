"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { launchSeasonWithPlans } from "@/server/actions/admin/commerce";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { TextArea } from "@/components/ui/textarea/textarea";
import { Select } from "@/components/ui/select/select"; // Assumed path based on Input
import { MONTHS } from "@/server/lib/months"; // Your provided path
import styles from "./wizard.module.scss";

// --- Types ---
interface WizardPlan {
  id: string;
  title: string;
  price: string;
  features: string;
  validityDays: string;
  allowInstallments: boolean;
  totalInstallments: string;
  fullPaymentDiscount: string;
}

// --- Animation Variants ---
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
};

export default function SeasonLaunchWizard() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // --- Step 1 State: Season Details ---
  const [seasonName, setSeasonName] = useState("");
  
  // New Deadline State (Day/Month/Year strings)
  const [deadline, setDeadline] = useState({
    day: "",
    month: "", // Will hold value "0" - "11"
    year: ""
  });

  // --- Step 2 State: Plans ---
  const [draftPlans, setDraftPlans] = useState<WizardPlan[]>([]);
  const [tempPlan, setTempPlan] = useState<WizardPlan>({
    id: "",
    title: "",
    price: "",
    features: "",
    validityDays: "365",
    allowInstallments: false,
    totalInstallments: "",
    fullPaymentDiscount: "",
  });

  // --- Helpers ---
  const handleDeadlineChange = (field: keyof typeof deadline, value: string) => {
    setDeadline((prev) => ({ ...prev, [field]: value }));
  };

  const resetTempPlan = () => {
    setTempPlan({
      id: "",
      title: "",
      price: "",
      features: "",
      validityDays: "365",
      allowInstallments: false,
      totalInstallments: "",
      fullPaymentDiscount: "",
    });
  };

  const addPlanToDraft = () => {
    const priceNum = Number(tempPlan.price);
    if (!tempPlan.title || !tempPlan.price || isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid title and price.");
      return;
    }
    setDraftPlans([...draftPlans, { ...tempPlan, id: crypto.randomUUID() }]);
    resetTempPlan();
    toast.success("Plan added to draft");
  };

  const removePlanFromDraft = (id: string) => {
    setDraftPlans(draftPlans.filter((p) => p.id !== id));
  };

  const navigateStep = (newStep: number) => {
    if (newStep > step) {
      if (step === 1 && !seasonName) {
        toast.error("Please enter a season name.");
        return;
      }
      if (step === 2 && draftPlans.length === 0) {
        toast.error("Please add at least one plan.");
        return;
      }
      setDirection(1);
    } else {
      setDirection(-1);
    }
    setStep(newStep);
  };

  const handleLaunch = async () => {
    setIsLoading(true);

    // Construct Date Object from Day/Month/Year
    let finalCloseDate: Date | undefined = undefined;
    
    // Only verify date if at least one field is filled
    if (deadline.day || deadline.month || deadline.year) {
        if (!deadline.day || !deadline.month || !deadline.year) {
            toast.error("Please complete the full date (Day, Month, and Year) or leave it empty.");
            setIsLoading(false);
            return;
        }

        // Create date (Months are 0-indexed in JS Date, exactly matching your MONTHS lib values)
        const d = new Date(Number(deadline.year), Number(deadline.month), Number(deadline.day), 23, 59, 59);
        
        // Validate Date (Check for invalid dates like Feb 30)
        if (isNaN(d.getTime()) || d.getMonth() !== Number(deadline.month)) {
            toast.error("Invalid Date provided.");
            setIsLoading(false);
            return;
        }
        finalCloseDate = d;
    }

    const payload = {
      seasonName,
      registrationCloseDate: finalCloseDate,
      plans: draftPlans.map((p) => ({
        title: p.title,
        price: Number(p.price),
        validityDays: Number(p.validityDays) || 365,
        features: p.features.split("\n").filter((f) => f.trim() !== ""),
        allowInstallments: p.allowInstallments,
        totalInstallments: Number(p.totalInstallments) || 1,
        fullPaymentDiscount: Number(p.fullPaymentDiscount) || 0,
      })),
    };

    const res = await launchSeasonWithPlans(payload);

    if (res.success) {
      toast.success("Season Launched Successfully! 🚀");
      setIsOpen(false);
      setTimeout(() => {
        setStep(1);
        setDraftPlans([]);
        setSeasonName("");
        setDeadline({ day: "", month: "", year: "" });
        router.refresh();
      }, 500);
    } else {
      toast.error(res.error || "Launch Failed");
    }
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        style={{ background: "#22c55e", color: "#000", fontWeight: 700 }}
      >
        + Launch New Season
      </Button>
    );
  }

  return (
    <div className={styles.overlay}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={styles.wizardModal}
      >
        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <h3>🚀 Launch Wizard</h3>
            <span className={styles.subHeader}>
              Step {step} of 3: {step === 1 ? "Details" : step === 2 ? "Plans" : "Review"}
            </span>
          </div>
          <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
            ✕
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarTrack}>
            <motion.div
              className={styles.progressBarFill}
              initial={{ width: "33%" }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className={styles.contentWrapper}>
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={styles.stepContainer}
              >
                <h4>1. Define The Season</h4>
                
                <div className={styles.inputGroup}>
                  <Input
                    label="Season Name"
                    placeholder="e.g. Season 5 (Winter 2025)"
                    value={seasonName}
                    onChange={(e) => setSeasonName(e.target.value)}
                    fullWidth
                    autoFocus
                  />
                </div>

                {/* --- CUSTOM DATE GRID (Day / Month / Year) --- */}
                <div className={styles.inputGroup}>
                    <label className={styles.label}>
                        Registration Deadline (Optional)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '16px' }}>
                        <Input
                            label="Day"
                            placeholder="DD"
                            type="number"
                            value={deadline.day}
                            onChange={(e) => handleDeadlineChange("day", e.target.value)}
                            maxLength={2}
                        />
                        <Select
                            label="Month"
                            value={deadline.month}
                            onChange={(e: any) => handleDeadlineChange("month", e.target.value)}
                            options={Object.fromEntries(MONTHS.map((m) => [m.value, m.label]))}
                        />
                        <Input
                            label="Year"
                            placeholder="YYYY"
                            type="number"
                            value={deadline.year}
                            onChange={(e) => handleDeadlineChange("year", e.target.value)}
                            maxLength={4}
                        />
                    </div>
                    <p className={styles.helperText}>
                        Leave all fields empty if registration stays open indefinitely.
                    </p>
                </div>

              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={styles.stepContainer}
              >
                <h4>2. Create Plans</h4>
                
                <div className={styles.miniForm}>
                  <div className={styles.twoCol}>
                    <Input
                      label="Title"
                      value={tempPlan.title}
                      onChange={(e) => setTempPlan({ ...tempPlan, title: e.target.value })}
                      placeholder="e.g. Founder+"
                    />
                    <Input
                      label="Price (₹)"
                      type="number"
                      value={tempPlan.price}
                      onChange={(e) => setTempPlan({ ...tempPlan, price: e.target.value })}
                      placeholder="0"
                    />
                  </div>

                  <div className={styles.twoCol}>
                    <Input
                      label="Validity (Days)"
                      type="number"
                      value={tempPlan.validityDays}
                      onChange={(e) => setTempPlan({ ...tempPlan, validityDays: e.target.value })}
                    />
                    <Input
                      label="Discount (%)"
                      type="number"
                      value={tempPlan.fullPaymentDiscount}
                      onChange={(e) => setTempPlan({ ...tempPlan, fullPaymentDiscount: e.target.value })}
                      placeholder="0"
                    />
                  </div>

                  <TextArea
                    label="Features (One per line)"
                    value={tempPlan.features}
                    onChange={(e) => setTempPlan({ ...tempPlan, features: e.target.value })}
                    rows={2}
                    placeholder="Feature 1..."
                  />

                  <div className={styles.toggleRowMini}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={tempPlan.allowInstallments}
                        onChange={(e) => setTempPlan({ ...tempPlan, allowInstallments: e.target.checked })}
                      />
                      Enable Installments
                    </label>
                    {tempPlan.allowInstallments && (
                      <input
                        type="number"
                        className={styles.smallInput}
                        placeholder="Count"
                        value={tempPlan.totalInstallments}
                        onChange={(e) => setTempPlan({ ...tempPlan, totalInstallments: e.target.value })}
                      />
                    )}
                  </div>

                  <Button
                    onClick={addPlanToDraft}
                    variant="secondary"
                    className={styles.addBtn}
                  >
                    + Add to List
                  </Button>
                </div>

                <div className={styles.draftList}>
                  {draftPlans.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className={styles.draftItem}
                    >
                      <div className={styles.draftInfo}>
                        <span className={styles.draftTitle}>{p.title}</span>
                        <span className={styles.draftPrice}>
                          ₹{Number(p.price).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <button
                        onClick={() => removePlanFromDraft(p.id)}
                        className={styles.removeBtn}
                      >
                        ✕
                      </button>
                    </motion.div>
                  ))}
                  {draftPlans.length === 0 && (
                    <p className={styles.emptyText}>No plans added yet.</p>
                  )}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={styles.stepContainer}
              >
                <h4>3. Review & Launch</h4>
                <div className={styles.summaryBox}>
                  <div className={styles.summaryRow}>
                    <span>Season Name:</span>
                    <strong>{seasonName}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Deadline:</span>
                    <strong>
                      {(deadline.day && deadline.month && deadline.year)
                        ? `${deadline.day}/${Number(deadline.month) + 1}/${deadline.year} (End of Day)`
                        : "Open Indefinitely"}
                    </strong>
                  </div>
                  <div className={styles.summaryDivider} />
                  <div className={styles.summaryPlans}>
                    <span>Plans ({draftPlans.length}):</span>
                    <ul>
                      {draftPlans.map((p) => (
                        <li key={p.id}>
                          {p.title} — ₹{Number(p.price).toLocaleString("en-IN")}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={styles.warningBox}>
                  ⚠️ <strong>WARNING:</strong> Launching this will immediately{" "}
                  <strong>ARCHIVE</strong> the current active season. Existing
                  active plans will be hidden from new users.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER ACTIONS */}
        <div className={styles.footer}>
          {step > 1 ? (
            <Button
              variant="secondary"
              onClick={() => navigateStep(step - 1)}
              disabled={isLoading}
            >
              ← Back
            </Button>
          ) : (
            <div /> 
          )}

          {step < 3 ? (
            <Button
              variant="primary"
              onClick={() => navigateStep(step + 1)}
              className={styles.nextBtn}
            >
              Next Step →
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleLaunch}
              disabled={isLoading}
              className={styles.launchBtn}
            >
              {isLoading ? "Launching..." : "🚀 PUBLISH LIVE"}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}