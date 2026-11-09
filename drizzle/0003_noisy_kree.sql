CREATE TABLE `pilot_file_work` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`submission_id` text NOT NULL,
	`payload` text NOT NULL,
	`updated` text NOT NULL
);
