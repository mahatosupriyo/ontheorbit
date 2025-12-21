import {
    timestamp,
    pgTable,
    text,
    boolean,
    integer,
    pgEnum,
    real,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

export const assetStatusEnum = pgEnum("asset_status", [
    "UPLOADING",
    "PROCESSING",
    "READY",
    "ERROR",
]);

export const courses = pgTable("course", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    poster: text("poster"), // S3 Key
    published: boolean("published").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const assets = pgTable("asset", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    muxAssetId: text("muxAssetId").unique(),
    playbackId: text("playbackId"),
    status: assetStatusEnum("status").default("UPLOADING"),
    duration: real("duration"),
    aspectRatio: text("aspectRatio"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lessons = pgTable("lesson", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    courseId: text("courseId")
        .notNull()
        .references(() => courses.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    thumbnail: text("thumbnail"),
    publishDate: timestamp("publishDate", { mode: "date" }),
    order: integer("order").default(0),

    assetId: text("assetId").references(() => assets.id),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});