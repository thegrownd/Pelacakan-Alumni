import { pgTable, serial, text, integer, timestamp, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const trackingStatusEnum = pgEnum("tracking_status", [
  "Teridentifikasi",
  "Perlu Verifikasi Manual",
  "Belum Ditemukan",
]);

export const candidateSourceEnum = pgEnum("candidate_source", [
  "LinkedIn",
  "Google Scholar",
  "ResearchGate",
  "Google",
]);

export const candidateStatusEnum = pgEnum("candidate_status", [
  "pending",
  "verified",
  "rejected",
]);

export const signalTypeEnum = pgEnum("signal_type", [
  "job_title",
  "company",
  "location",
  "education",
  "publication",
]);

export const mAlumni = pgTable("m_alumni", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  major: text("major").notNull(),
  graduationYear: integer("graduation_year").notNull(),
  nameVariations: text("name_variations").array().notNull().default([]),
  affiliationKeywords: text("affiliation_keywords").array().notNull().default([]),
  trackingStatus: trackingStatusEnum("tracking_status").notNull().default("Belum Ditemukan"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tSearchCandidates = pgTable("t_search_candidates", {
  id: serial("id").primaryKey(),
  alumniId: integer("alumni_id").notNull().references(() => mAlumni.id, { onDelete: "cascade" }),
  source: candidateSourceEnum("source").notNull(),
  sourceUrl: text("source_url"),
  snippet: text("snippet").notNull(),
  confidenceScore: real("confidence_score").notNull().default(0),
  nameMatchScore: real("name_match_score").notNull().default(0),
  affiliationScore: real("affiliation_score").notNull().default(0),
  majorScore: real("major_score").notNull().default(0),
  timelineScore: real("timeline_score").notNull().default(0),
  status: candidateStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tExtractedSignals = pgTable("t_extracted_signals", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull().references(() => tSearchCandidates.id, { onDelete: "cascade" }),
  signalType: signalTypeEnum("signal_type").notNull(),
  value: text("value").notNull(),
  source: text("source").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAlumniSchema = createInsertSchema(mAlumni).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCandidateSchema = createInsertSchema(tSearchCandidates).omit({ id: true, createdAt: true });
export const insertSignalSchema = createInsertSchema(tExtractedSignals).omit({ id: true, createdAt: true });

export type Alumni = typeof mAlumni.$inferSelect;
export type InsertAlumni = z.infer<typeof insertAlumniSchema>;
export type Candidate = typeof tSearchCandidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type ExtractedSignal = typeof tExtractedSignals.$inferSelect;
export type InsertSignal = z.infer<typeof insertSignalSchema>;
