import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const members = sqliteTable('pilot_members', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  role: text('role').notNull(),
  created: text('created').notNull(),
});
export const saves = sqliteTable('pilot_saves', {
  userId: text('user_id').primaryKey(),
  payload: text('payload').notNull(),
  revision: integer('revision').notNull(),
  updated: text('updated').notNull(),
});
export const submissions = sqliteTable('pilot_submissions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  caseId: text('case_id').notNull(),
  version: text('version').notNull(),
  name: text('name').notNull(),
  fileKey: text('file_key').notNull(),
  size: integer('size').notNull(),
  mime: text('mime').notNull(),
  created: text('created').notNull(),
  parentId: text('parent_id'),
  revisionNote: text('revision_note').notNull(),
  reviewerId: text('reviewer_id'),
  outputs: text('outputs').notNull(),
});
export const reviews = sqliteTable('pilot_reviews', {
  id: text('id').primaryKey(),
  submissionId: text('submission_id').notNull().unique(),
  reviewerId: text('reviewer_id').notNull(),
  payload: text('payload').notNull(),
  created: text('created').notNull(),
});

export const learning = sqliteTable('pilot_learning', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  caseId: text('case_id').notNull(),
  version: text('version').notNull(),
  payload: text('payload').notNull(),
  revision: integer('revision').notNull(),
  updated: text('updated').notNull(),
});
export const reviewDrafts = sqliteTable('pilot_review_drafts', {
  id: text('id').primaryKey(),
  reviewerId: text('reviewer_id').notNull(),
  submissionId: text('submission_id').notNull(),
  payload: text('payload').notNull(),
  updated: text('updated').notNull(),
});

export const pilotFeedback = sqliteTable('pilot_feedback', {
  userId: text('user_id').primaryKey(),
  payload: text('payload').notNull(),
  updated: text('updated').notNull(),
});

export const fileWork = sqliteTable('pilot_file_work', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  submissionId: text('submission_id').notNull(),
  payload: text('payload').notNull(),
  updated: text('updated').notNull(),
});

// Pilot ayarları (ör. kör değerlendirme). Anahtar/değer olarak saklanır.
export const settings = sqliteTable('pilot_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updated: text('updated').notNull(),
});
