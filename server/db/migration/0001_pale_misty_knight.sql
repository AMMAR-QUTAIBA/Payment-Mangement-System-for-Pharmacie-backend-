CREATE TABLE `medicine` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`medicine_name` text NOT NULL,
	`price` integer NOT NULL,
	`expair` integer NOT NULL,
	`addedAt` integer NOT NULL,
	`userid` integer NOT NULL,
	`medicine_Amount` integer NOT NULL,
	`catgory` text NOT NULL,
	`description` text NOT NULL,
	`manfacture` text NOT NULL,
	FOREIGN KEY (`userid`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `medicine_medicine_name_unique` ON `medicine` (`medicine_name`);--> statement-breakpoint
CREATE TABLE `session` (
	`session` text PRIMARY KEY NOT NULL,
	`userid` integer NOT NULL,
	`creatAt` text NOT NULL,
	FOREIGN KEY (`userid`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`creatAt` text NOT NULL,
	`salt` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "email", "password", "role", "creatAt", "salt") SELECT "id", "name", "email", "password", "role", "creatAt", "salt" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);