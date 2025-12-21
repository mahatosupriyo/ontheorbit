import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as authSchema from "./schema/auth";
import * as contentSchema from "./schema/content";
import * as commerceSchema from "./schema/commerce";
import * as relationsSchema from "./schema/relations";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const schema = {
    ...authSchema,
    ...contentSchema,
    ...commerceSchema,
    ...relationsSchema,
};

export const db = drizzle(pool, { schema });