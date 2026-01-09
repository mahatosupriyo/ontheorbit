import {
    timestamp,
    pgTable,
    text,
    integer,
    boolean,
    pgEnum,
    index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth"; // Adjust path

// --- ENUMS ---
export const subscriptionStatusEnum = pgEnum("subscription_status", [
    "ACTIVE",
    "PAST_DUE",
    "CANCELED",
    "REFUND_PROCESSING", // New
    "REFUNDED",
    "EXPIRED",
    "PENDING_INSTALLMENT",
]);

export const batchStatusEnum = pgEnum("batch_status", ["ACTIVE", "ARCHIVED", "DRAFT"]);

// --- 1. BATCHES (SEASONS) ---
export const batches = pgTable("batch", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(), // e.g., "Season 1"
    status: batchStatusEnum("status").default("ACTIVE").notNull(),

    // LIFECYCLE DATES
    startDate: timestamp("startDate").defaultNow(), // When the cohort actually starts
    registrationCloseDate: timestamp("registrationCloseDate"), // When sales stop
    endDate: timestamp("endDate"), // When the season officially ends

    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    statusIdx: index("batch_status_idx").on(table.status),
}));

// --- 2. PLANS ---
export const plans = pgTable("plan", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

    // Link to Batch
    batchId: text("batchId")
        .notNull()
        .references(() => batches.id, { onDelete: "restrict" }), // Prevent deleting batch if plans exist

    title: text("title").notNull(),
    description: text("description"),
    price: integer("price").notNull(), // Paise
    features: text("features").array(),
    validityDays: integer("validityDays").default(365),

    // Installment Logic
    allowInstallments: boolean("allowInstallments").default(false),
    totalInstallments: integer("totalInstallments").default(1),
    fullPaymentDiscount: integer("fullPaymentDiscount").default(0),

    // Visibility (Admin can hide specific plans even inside an active batch)
    isActive: boolean("isActive").default(true),

    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    batchIdx: index("plan_batch_idx").on(table.batchId),
}));

// --- 3. SUBSCRIPTIONS ---
export const subscriptions = pgTable("subscription", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    planId: text("planId").notNull().references(() => plans.id),

    status: subscriptionStatusEnum("status").default("ACTIVE"),

    // Timestamps
    startDate: timestamp("startDate").defaultNow(),
    endDate: timestamp("endDate"),

    // Payment Tracking
    totalAmount: integer("totalAmount").notNull(),
    amountPaid: integer("amountPaid").default(0),
    installmentsPaid: integer("installmentsPaid").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- 4. PAYMENTS ---
export const payments = pgTable("payment", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull().references(() => users.id),
    subscriptionId: text("subscriptionId").references(() => subscriptions.id),

    razorpayOrderId: text("razorpayOrderId").unique().notNull(),
    razorpayPaymentId: text("razorpayPaymentId"),
    amount: integer("amount").notNull(),
    status: text("status").notNull(), // created, captured, failed
    installmentIndex: integer("installmentIndex").default(1),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- RELATIONS ---
export const batchRelations = relations(batches, ({ many }) => ({
    plans: many(plans),
}));

export const planRelations = relations(plans, ({ one, many }) => ({
    batch: one(batches, { fields: [plans.batchId], references: [batches.id] }),
    subscriptions: many(subscriptions),
}));