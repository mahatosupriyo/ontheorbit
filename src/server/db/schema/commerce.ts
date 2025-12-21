import {
    timestamp,
    pgTable,
    text,
    integer,
    boolean,
    pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
    "ACTIVE",
    "PAST_DUE",
    "CANCELED",
    "EXPIRED",
    "PENDING_INSTALLMENT",
]);

export const plans = pgTable("plan", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    description: text("description"),
    price: integer("price").notNull(), // stored in Paise
    features: text("features").array(),
    poster: text("poster"),
    validityDays: integer("validityDays").default(365),
    allowInstallments: boolean("allowInstallments").default(false),
    totalInstallments: integer("totalInstallments").default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscription", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    planId: text("planId")
        .notNull()
        .references(() => plans.id),
    status: subscriptionStatusEnum("status").default("ACTIVE"),
    startDate: timestamp("startDate").defaultNow(),
    endDate: timestamp("endDate"),
    totalAmount: integer("totalAmount").notNull(),
    amountPaid: integer("amountPaid").default(0),
    installmentsPaid: integer("installmentsPaid").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = pgTable("payment", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
        .notNull()
        .references(() => users.id),
    subscriptionId: text("subscriptionId").references(() => subscriptions.id),
    razorpayOrderId: text("razorpayOrderId").unique().notNull(),
    razorpayPaymentId: text("razorpayPaymentId"),
    amount: integer("amount").notNull(),
    status: text("status").notNull(),
    installmentIndex: integer("installmentIndex").default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});