import {
    timestamp,
    pgTable,
    text,
    primaryKey,
    integer,
    pgEnum,
    boolean,
} from "drizzle-orm/pg-core";
export const genderEnum = pgEnum("gender", ["Male", "Female", "Non-binary", "Prefer not to say"]);

export type UserRole = "USER" | "ADMIN";

export const userRoleEnum = pgEnum("user_role", ["USER", "ADMIN"]);

export const users = pgTable("user", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    username: text("username").unique(),
    email: text("email").unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image").default("https://ontheorbit.com/placeholder.png"),
    role: userRoleEnum("role").default("USER"),
    country: text("country").default("Unknown"),

    gender: genderEnum("gender"),
    dateOfBirth: timestamp("dateOfBirth", { mode: "date" }),

    about: text("about"),
    portfolioUrl: text("portfolioUrl"),
    phoneNumber: text("phoneNumber"),
    usernameChanged: boolean("usernameChanged").default(false),

    nameUpdatedAt: timestamp("nameUpdatedAt"),
    usernameUpdatedAt: timestamp("usernameUpdatedAt"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const accounts = pgTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    })
);

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (vt) => ({
        compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    })
);