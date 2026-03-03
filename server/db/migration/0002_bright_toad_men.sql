ALTER TABLE `medicine` RENAME COLUMN "userid" TO "addedBy";--> statement-breakpoint
CREATE TABLE `bills` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_sell` integer NOT NULL,
	`bill_Date` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`total_price` integer NOT NULL,
	`payment_type` text NOT NULL,
	`card_token` text DEFAULT null,
	`card_salt` text DEFAULT null,
	`last card 4Number` text DEFAULT null,
	FOREIGN KEY (`user_sell`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bills_product` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`medicine_id` integer NOT NULL,
	`bill_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	`product_price` integer,
	FOREIGN KEY (`medicine_id`) REFERENCES `medicine`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `section` (
	`sesctionid` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `section_name_unique` ON `section` (`name`);--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
DROP INDEX "medicine_medicine_name_unique";--> statement-breakpoint
DROP INDEX "section_name_unique";--> statement-breakpoint
ALTER TABLE `medicine` ALTER COLUMN "addedAt" TO "addedAt" text NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `medicine_medicine_name_unique` ON `medicine` (`medicine_name`);--> statement-breakpoint
ALTER TABLE `medicine` ADD `section` integer REFERENCES section(sesctionid);--> statement-breakpoint
ALTER TABLE `medicine` ADD `image` text NOT NULL;--> statement-breakpoint
ALTER TABLE `medicine` ALTER COLUMN "addedBy" TO "addedBy" integer NOT NULL REFERENCES users(id) ON DELETE no action ON UPDATE no action;