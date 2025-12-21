import { relations } from "drizzle-orm";
import { users, accounts, sessions } from "./auth";
import { courses, lessons, assets } from "./content";
import { plans, subscriptions, payments } from "./commerce";

export const userRelations = relations(users, ({ many }) => ({
    accounts: many(accounts),
    sessions: many(sessions),
    courses: many(courses),
    subscriptions: many(subscriptions),
    payments: many(payments),
}));

export const courseRelations = relations(courses, ({ one, many }) => ({
    user: one(users, {
        fields: [courses.userId],
        references: [users.id],
    }),
    lessons: many(lessons),
}));

export const lessonRelations = relations(lessons, ({ one }) => ({
    course: one(courses, {
        fields: [lessons.courseId],
        references: [courses.id],
    }),
    asset: one(assets, {
        fields: [lessons.assetId],
        references: [assets.id],
    }),
}));

export const subscriptionRelations = relations(subscriptions, ({ one, many }) => ({
    user: one(users, {
        fields: [subscriptions.userId],
        references: [users.id],
    }),
    plan: one(plans, {
        fields: [subscriptions.planId],
        references: [plans.id],
    }),
    payments: many(payments),
}));

export const paymentRelations = relations(payments, ({ one }) => ({
    user: one(users, {
        fields: [payments.userId],
        references: [users.id],
    }),
    subscription: one(subscriptions, {
        fields: [payments.subscriptionId],
        references: [subscriptions.id],
    }),
}));