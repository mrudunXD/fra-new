import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const claimStatusEnum = pgEnum("claim_status", ["pending", "approved", "rejected", "review_required"]);
export const fileStatusEnum = pgEnum("file_status", ["uploaded", "processing", "processed", "failed"]);

// Tables
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const claims = pgTable("claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  claimId: text("claim_id").notNull().unique(), // e.g., FRA-2024-001
  
  // Basic Information
  claimantName: text("claimant_name").notNull(),
  spouseName: text("spouse_name"),
  fatherMotherName: text("father_mother_name"),
  address: text("address"),
  village: text("village").notNull(),
  gramPanchayat: text("gram_panchayat"),
  tehsilTaluka: text("tehsil_taluka"),
  district: text("district"),
  state: text("state"),
  
  // Tribal Status
  scheduledTribe: text("scheduled_tribe"), // Yes/No
  scheduledTribeCertificate: text("scheduled_tribe_certificate"), // Certificate details
  otherTraditionalForestDweller: text("other_traditional_forest_dweller"), // Yes/No
  spouseScheduledTribe: text("spouse_scheduled_tribe"), // Yes/No if spouse is ST
  
  // Family Members (stored as JSON array)
  familyMembers: jsonb("family_members"), // [{name: string, age: number, relation: string}]
  
  // Nature of Claim on Land
  landForHabitation: decimal("land_for_habitation", { precision: 10, scale: 2 }),
  landForSelfCultivation: decimal("land_for_self_cultivation", { precision: 10, scale: 2 }),
  disputedLands: decimal("disputed_lands", { precision: 10, scale: 2 }),
  pattasLeasesGrants: decimal("pattas_leases_grants", { precision: 10, scale: 2 }),
  landForRehabilitationAlternative: decimal("land_for_rehabilitation_alternative", { precision: 10, scale: 2 }),
  landDisplacedWithoutCompensation: decimal("land_displaced_without_compensation", { precision: 10, scale: 2 }),
  
  // Legacy fields for backward compatibility
  area: decimal("area", { precision: 10, scale: 2 }).notNull(), // Total area in hectares
  surveyNumber: text("survey_number"),
  
  // System fields
  status: claimStatusEnum("status").default("pending").notNull(),
  ocrConfidence: integer("ocr_confidence"), // percentage 0-100
  boundaryGeometry: jsonb("boundary_geometry"), // GeoJSON
  rawOcrText: text("raw_ocr_text"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const uploadedFiles = pgTable("uploaded_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimetype: text("mimetype").notNull(),
  size: integer("size").notNull(), // in bytes
  status: fileStatusEnum("status").default("uploaded").notNull(),
  claimId: varchar("claim_id").references(() => claims.id),
  userId: varchar("user_id").references(() => users.id),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  claims: many(claims),
  uploadedFiles: many(uploadedFiles),
}));

export const claimsRelations = relations(claims, ({ one, many }) => ({
  user: one(users, {
    fields: [claims.userId],
    references: [users.id],
  }),
  files: many(uploadedFiles),
}));

export const uploadedFilesRelations = relations(uploadedFiles, ({ one }) => ({
  claim: one(claims, {
    fields: [uploadedFiles.claimId],
    references: [claims.id],
  }),
  user: one(users, {
    fields: [uploadedFiles.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFileSchema = createInsertSchema(uploadedFiles).omit({
  id: true,
  uploadedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Claim = typeof claims.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type UploadedFile = typeof uploadedFiles.$inferSelect;

// API response types
export type ClaimWithFiles = Claim & {
  files: UploadedFile[];
};

export type DashboardStats = {
  totalClaims: number;
  processed: number;
  totalArea: number;
  pending: number;
};

export type OCRResult = {
  // Basic Information
  claimantName: string;
  spouseName?: string;
  fatherMotherName?: string;
  address?: string;
  village: string;
  gramPanchayat?: string;
  tehsilTaluka?: string;
  district?: string;
  state?: string;
  
  // Tribal Status
  scheduledTribe?: string;
  scheduledTribeCertificate?: string;
  otherTraditionalForestDweller?: string;
  spouseScheduledTribe?: string;
  
  // Family Members
  familyMembers?: Array<{name: string; age: number; relation: string}>;
  
  // Nature of Claim on Land
  landForHabitation?: number;
  landForSelfCultivation?: number;
  disputedLands?: number;
  pattasLeasesGrants?: number;
  landForRehabilitationAlternative?: number;
  landDisplacedWithoutCompensation?: number;
  
  // Legacy fields
  claimId: string;
  area: string;
  surveyNumber?: string;
  rawText: string;
  confidence: number;
};
