CREATE TABLE IF NOT EXISTS "pets" (
	"uuid" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"display_name" text NOT NULL,
	"type" text NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"upgrade_slots" json DEFAULT '[]'::json NOT NULL,
	"bought_slot" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pets_display_name_unique" UNIQUE("display_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"balance" double precision DEFAULT 0 NOT NULL,
	"active_pet_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_active_pet_id_pets_uuid_fk" FOREIGN KEY ("active_pet_id") REFERENCES "public"."pets"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
