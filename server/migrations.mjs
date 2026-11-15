// Üretilmiş dosya: tools/build-migrations.mjs (kaynak: drizzle/*.sql)
export const MIGRATIONS = [
  {
    "tag": "0000_quick_sir_ram",
    "statements": [
      "CREATE TABLE `pilot_members` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`email` text NOT NULL,\n\t`role` text NOT NULL,\n\t`created` text NOT NULL\n)",
      "CREATE TABLE `pilot_reviews` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`submission_id` text NOT NULL,\n\t`reviewer_id` text NOT NULL,\n\t`payload` text NOT NULL,\n\t`created` text NOT NULL\n)",
      "CREATE UNIQUE INDEX `pilot_reviews_submission_id_unique` ON `pilot_reviews` (`submission_id`);",
      "CREATE TABLE `pilot_saves` (\n\t`user_id` text PRIMARY KEY NOT NULL,\n\t`payload` text NOT NULL,\n\t`revision` integer NOT NULL,\n\t`updated` text NOT NULL\n)",
      "CREATE TABLE `pilot_submissions` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`user_id` text NOT NULL,\n\t`case_id` text NOT NULL,\n\t`version` text NOT NULL,\n\t`name` text NOT NULL,\n\t`file_key` text NOT NULL,\n\t`size` integer NOT NULL,\n\t`mime` text NOT NULL,\n\t`created` text NOT NULL,\n\t`parent_id` text,\n\t`revision_note` text NOT NULL,\n\t`reviewer_id` text,\n\t`outputs` text NOT NULL\n)"
    ]
  },
  {
    "tag": "0001_messy_vector",
    "statements": [
      "CREATE TABLE `pilot_learning` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`user_id` text NOT NULL,\n\t`case_id` text NOT NULL,\n\t`version` text NOT NULL,\n\t`payload` text NOT NULL,\n\t`revision` integer NOT NULL,\n\t`updated` text NOT NULL\n)",
      "CREATE TABLE `pilot_review_drafts` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`reviewer_id` text NOT NULL,\n\t`submission_id` text NOT NULL,\n\t`payload` text NOT NULL,\n\t`updated` text NOT NULL\n)"
    ]
  },
  {
    "tag": "0002_overjoyed_the_professor",
    "statements": [
      "CREATE TABLE `pilot_feedback` (\n\t`user_id` text PRIMARY KEY NOT NULL,\n\t`payload` text NOT NULL,\n\t`updated` text NOT NULL\n)"
    ]
  },
  {
    "tag": "0003_noisy_kree",
    "statements": [
      "CREATE TABLE `pilot_file_work` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`user_id` text NOT NULL,\n\t`submission_id` text NOT NULL,\n\t`payload` text NOT NULL,\n\t`updated` text NOT NULL\n)"
    ]
  },
  {
    "tag": "0004_blind_review_settings",
    "statements": [
      "CREATE TABLE `pilot_settings` (\n\t`key` text PRIMARY KEY NOT NULL,\n\t`value` text NOT NULL,\n\t`updated` text NOT NULL\n)"
    ]
  }
];
