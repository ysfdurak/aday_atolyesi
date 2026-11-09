CREATE TABLE `pilot_learning` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`case_id` text NOT NULL,
	`version` text NOT NULL,
	`payload` text NOT NULL,
	`revision` integer NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pilot_review_drafts` (
	`id` text PRIMARY KEY NOT NULL,
	`reviewer_id` text NOT NULL,
	`submission_id` text NOT NULL,
	`payload` text NOT NULL,
	`updated` text NOT NULL
);
