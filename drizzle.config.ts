import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: [
        "./src/server/db/schema/auth.ts",
        "./src/server/db/schema/content.ts",
        "./src/server/db/schema/commerce.ts",
        "./src/server/db/schema/relations.ts",
    ],
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DIRECT_URL!,
    },
});