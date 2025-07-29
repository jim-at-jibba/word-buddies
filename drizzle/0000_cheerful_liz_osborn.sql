CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`date` integer NOT NULL,
	`words_attempted` integer NOT NULL,
	`correct_words` integer NOT NULL,
	`score` real NOT NULL,
	`duration` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `word_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text,
	`word` text NOT NULL,
	`user_spelling` text NOT NULL,
	`is_correct` integer NOT NULL,
	`attempts` integer DEFAULT 1,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `words` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`word` text NOT NULL,
	`difficulty` integer DEFAULT 1,
	`attempts` integer DEFAULT 0,
	`correct_attempts` integer DEFAULT 0,
	`last_attempted` integer,
	`next_review` integer,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `words_word_unique` ON `words` (`word`);