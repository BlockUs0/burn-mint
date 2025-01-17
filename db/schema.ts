import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
});

export const burns = pgTable("burns", {
  id: serial("id").primaryKey(),
  tokenId: text("token_id").notNull(),
  txHash: text("tx_hash").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// User schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

// Burn schemas
export const insertBurnSchema = createInsertSchema(burns);
export const selectBurnSchema = createSelectSchema(burns);
export type InsertBurn = typeof burns.$inferInsert;
export type SelectBurn = typeof burns.$inferSelect;