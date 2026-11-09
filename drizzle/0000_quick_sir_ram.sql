CREATE TABLE `pilot_members` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pilot_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`reviewer_id` text NOT NULL,
	`payload` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pilot_reviews_submission_id_unique` ON `pilot_reviews` (`submission_id`);--> statement-breakpoint
CREATE TABLE `pilot_saves` (
	`user_id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`revision` integer NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pilot_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`case_id` text NOT NULL,
	`version` text NOT NULL,
	`name` text NOT NULL,
	`file_key` text NOT NULL,
	`size` integer NOT NULL,
	`mime` text NOT NULL,
	`created` text NOT NULL,
	`parent_id` text,
	`revision_note` text NOT NULL,
	`reviewer_id` text,
	`outputs` text NOT NULL
);
