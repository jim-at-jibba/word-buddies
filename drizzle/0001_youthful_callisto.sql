PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_words` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`word` text NOT NULL,
	`difficulty` integer DEFAULT 1 NOT NULL,
	`attempts` integer DEFAULT 0,
	`correct_attempts` integer DEFAULT 0,
	`last_attempted` integer,
	`next_review` integer,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
INSERT INTO `__new_words`("id", "word", "difficulty", "attempts", "correct_attempts", "last_attempted", "next_review", "created_at") SELECT "id", "word", "difficulty", "attempts", "correct_attempts", "last_attempted", "next_review", "created_at" FROM `words`;--> statement-breakpoint
DROP TABLE `words`;--> statement-breakpoint
ALTER TABLE `__new_words` RENAME TO `words`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `words_word_unique` ON `words` (`word`);