import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`height\` text DEFAULT 'full',
  	\`align\` text DEFAULT 'right',
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_order_idx\` ON \`pages_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_parent_id_idx\` ON \`pages_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_path_idx\` ON \`pages_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_image_idx\` ON \`pages_blocks_hero\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_hero_locales\` (
  	\`heading\` text,
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_hero_locales_locale_parent_id_unique\` ON \`pages_blocks_hero_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_locales_parent_id_idx\` ON \`pages_blocks_hero_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_tagline\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_tagline_order_idx\` ON \`pages_blocks_tagline\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_tagline_parent_id_idx\` ON \`pages_blocks_tagline\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_tagline_path_idx\` ON \`pages_blocks_tagline\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_tagline_locales\` (
  	\`heading\` text,
  	\`subheading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_tagline\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_tagline_locales_locale_parent_id_unique\` ON \`pages_blocks_tagline_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_tagline_locales_parent_id_idx\` ON \`pages_blocks_tagline_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_section_heading\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`tone\` text DEFAULT 'accent',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_section_heading_order_idx\` ON \`pages_blocks_section_heading\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_section_heading_parent_id_idx\` ON \`pages_blocks_section_heading\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_section_heading_path_idx\` ON \`pages_blocks_section_heading\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_section_heading_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_section_heading\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_section_heading_locales_locale_parent_id_unique\` ON \`pages_blocks_section_heading_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_section_heading_locales_parent_id_idx\` ON \`pages_blocks_section_heading_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_team_members\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_team\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_team_members_order_idx\` ON \`pages_blocks_team_members\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_team_members_parent_id_idx\` ON \`pages_blocks_team_members\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_team_members_image_idx\` ON \`pages_blocks_team_members\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_team_members_locales\` (
  	\`name\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_team_members\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_team_members_locales_locale_parent_id_unique\` ON \`pages_blocks_team_members_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_team_members_locales_parent_id_idx\` ON \`pages_blocks_team_members_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_team\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'page',
  	\`link_page_id\` integer,
  	\`link_project_id\` integer,
  	\`link_url\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`link_project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_team_order_idx\` ON \`pages_blocks_team\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_team_parent_id_idx\` ON \`pages_blocks_team\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_team_path_idx\` ON \`pages_blocks_team\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_team_link_link_page_idx\` ON \`pages_blocks_team\` (\`link_page_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_team_link_link_project_idx\` ON \`pages_blocks_team\` (\`link_project_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_team_locales\` (
  	\`heading\` text,
  	\`link_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_team\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_team_locales_locale_parent_id_unique\` ON \`pages_blocks_team_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_team_locales_parent_id_idx\` ON \`pages_blocks_team_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_image_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`height\` text DEFAULT 'natural',
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_image_banner_order_idx\` ON \`pages_blocks_image_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_image_banner_parent_id_idx\` ON \`pages_blocks_image_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_image_banner_path_idx\` ON \`pages_blocks_image_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_image_banner_image_idx\` ON \`pages_blocks_image_banner\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_featured_projects\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'page',
  	\`link_page_id\` integer,
  	\`link_project_id\` integer,
  	\`link_url\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`link_project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_featured_projects_order_idx\` ON \`pages_blocks_featured_projects\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_featured_projects_parent_id_idx\` ON \`pages_blocks_featured_projects\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_featured_projects_path_idx\` ON \`pages_blocks_featured_projects\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_featured_projects_link_link_page_idx\` ON \`pages_blocks_featured_projects\` (\`link_page_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_featured_projects_link_link_project_idx\` ON \`pages_blocks_featured_projects\` (\`link_project_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_featured_projects_locales\` (
  	\`heading\` text,
  	\`link_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_featured_projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_featured_projects_locales_locale_parent_id_uniq\` ON \`pages_blocks_featured_projects_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_featured_projects_locales_parent_id_idx\` ON \`pages_blocks_featured_projects_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_projects_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`source\` text DEFAULT 'all',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_projects_grid_order_idx\` ON \`pages_blocks_projects_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_projects_grid_parent_id_idx\` ON \`pages_blocks_projects_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_projects_grid_path_idx\` ON \`pages_blocks_projects_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_testimonial\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'page',
  	\`link_page_id\` integer,
  	\`link_project_id\` integer,
  	\`link_url\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`link_project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonial_order_idx\` ON \`pages_blocks_testimonial\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonial_parent_id_idx\` ON \`pages_blocks_testimonial\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonial_path_idx\` ON \`pages_blocks_testimonial\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonial_link_link_page_idx\` ON \`pages_blocks_testimonial\` (\`link_page_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonial_link_link_project_idx\` ON \`pages_blocks_testimonial\` (\`link_project_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_testimonial_locales\` (
  	\`quote\` text,
  	\`author\` text,
  	\`link_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_testimonial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_testimonial_locales_locale_parent_id_unique\` ON \`pages_blocks_testimonial_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonial_locales_parent_id_idx\` ON \`pages_blocks_testimonial_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_instagram\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_instagram_order_idx\` ON \`pages_blocks_instagram\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_instagram_parent_id_idx\` ON \`pages_blocks_instagram\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_instagram_path_idx\` ON \`pages_blocks_instagram\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_instagram_image_idx\` ON \`pages_blocks_instagram\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_instagram_locales\` (
  	\`heading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_instagram\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_instagram_locales_locale_parent_id_unique\` ON \`pages_blocks_instagram_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_instagram_locales_parent_id_idx\` ON \`pages_blocks_instagram_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_tiles_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`kind\` text DEFAULT 'image',
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_tiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_tiles_items_order_idx\` ON \`pages_blocks_tiles_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_tiles_items_parent_id_idx\` ON \`pages_blocks_tiles_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_tiles_items_image_idx\` ON \`pages_blocks_tiles_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_tiles_items_locales\` (
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_tiles_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_tiles_items_locales_locale_parent_id_unique\` ON \`pages_blocks_tiles_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_tiles_items_locales_parent_id_idx\` ON \`pages_blocks_tiles_items_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_tiles\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_tiles_order_idx\` ON \`pages_blocks_tiles\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_tiles_parent_id_idx\` ON \`pages_blocks_tiles\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_tiles_path_idx\` ON \`pages_blocks_tiles\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_lead\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_lead_order_idx\` ON \`pages_blocks_lead\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_lead_parent_id_idx\` ON \`pages_blocks_lead\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_lead_path_idx\` ON \`pages_blocks_lead\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_lead_locales\` (
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_lead\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_lead_locales_locale_parent_id_unique\` ON \`pages_blocks_lead_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_lead_locales_parent_id_idx\` ON \`pages_blocks_lead_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`button_type\` text DEFAULT 'page',
  	\`button_page_id\` integer,
  	\`button_project_id\` integer,
  	\`button_url\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`button_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`button_project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_rich_text_order_idx\` ON \`pages_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_rich_text_parent_id_idx\` ON \`pages_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_rich_text_path_idx\` ON \`pages_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_rich_text_button_button_page_idx\` ON \`pages_blocks_rich_text\` (\`button_page_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_rich_text_button_button_project_idx\` ON \`pages_blocks_rich_text\` (\`button_project_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_rich_text_locales\` (
  	\`heading\` text,
  	\`content\` text,
  	\`button_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_rich_text\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_rich_text_locales_locale_parent_id_unique\` ON \`pages_blocks_rich_text_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_rich_text_locales_parent_id_idx\` ON \`pages_blocks_rich_text_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_items_order_idx\` ON \`pages_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_items_parent_id_idx\` ON \`pages_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_faq_items_locales\` (
  	\`question\` text,
  	\`answer\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_faq_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_faq_items_locales_locale_parent_id_unique\` ON \`pages_blocks_faq_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_items_locales_parent_id_idx\` ON \`pages_blocks_faq_items_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_order_idx\` ON \`pages_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_parent_id_idx\` ON \`pages_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_path_idx\` ON \`pages_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_faq_locales\` (
  	\`heading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_faq_locales_locale_parent_id_unique\` ON \`pages_blocks_faq_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_locales_parent_id_idx\` ON \`pages_blocks_faq_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_collage\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`columns\` text DEFAULT '3',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_collage_order_idx\` ON \`pages_blocks_collage\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_collage_parent_id_idx\` ON \`pages_blocks_collage\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_collage_path_idx\` ON \`pages_blocks_collage\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_contact_form\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_form_order_idx\` ON \`pages_blocks_contact_form\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_form_parent_id_idx\` ON \`pages_blocks_contact_form\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_form_path_idx\` ON \`pages_blocks_contact_form\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_contact_form_locales\` (
  	\`intro\` text,
  	\`success_heading\` text,
  	\`success_text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_contact_form\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_contact_form_locales_locale_parent_id_unique\` ON \`pages_blocks_contact_form_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_form_locales_parent_id_idx\` ON \`pages_blocks_contact_form_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'page',
  	\`link_page_id\` integer,
  	\`link_project_id\` integer,
  	\`link_url\` text,
  	\`style\` text DEFAULT 'solid',
  	\`block_name\` text,
  	FOREIGN KEY (\`link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`link_project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_order_idx\` ON \`pages_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_parent_id_idx\` ON \`pages_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_path_idx\` ON \`pages_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_link_link_page_idx\` ON \`pages_blocks_cta\` (\`link_page_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_link_link_project_idx\` ON \`pages_blocks_cta\` (\`link_project_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cta_locales\` (
  	\`link_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_cta_locales_locale_parent_id_unique\` ON \`pages_blocks_cta_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_locales_parent_id_idx\` ON \`pages_blocks_cta_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`seo_image_id\` integer,
  	\`seo_noindex\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_slug_idx\` ON \`pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`pages_seo_seo_image_idx\` ON \`pages\` (\`seo_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`pages__status_idx\` ON \`pages\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`pages_locales\` (
  	\`title\` text,
  	\`seo_title\` text,
  	\`seo_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_locales_locale_parent_id_unique\` ON \`pages_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_locales_parent_id_idx\` ON \`pages_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`projects_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_rels_order_idx\` ON \`pages_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_parent_idx\` ON \`pages_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_path_idx\` ON \`pages_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_projects_id_idx\` ON \`pages_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_media_id_idx\` ON \`pages_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`height\` text DEFAULT 'full',
  	\`align\` text DEFAULT 'right',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_order_idx\` ON \`_pages_v_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_parent_id_idx\` ON \`_pages_v_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_path_idx\` ON \`_pages_v_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_image_idx\` ON \`_pages_v_blocks_hero\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_hero_locales\` (
  	\`heading\` text,
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_hero_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_hero_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_locales_parent_id_idx\` ON \`_pages_v_blocks_hero_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_tagline\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_tagline_order_idx\` ON \`_pages_v_blocks_tagline\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_tagline_parent_id_idx\` ON \`_pages_v_blocks_tagline\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_tagline_path_idx\` ON \`_pages_v_blocks_tagline\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_tagline_locales\` (
  	\`heading\` text,
  	\`subheading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_tagline\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_tagline_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_tagline_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_tagline_locales_parent_id_idx\` ON \`_pages_v_blocks_tagline_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_section_heading\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`tone\` text DEFAULT 'accent',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_section_heading_order_idx\` ON \`_pages_v_blocks_section_heading\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_section_heading_parent_id_idx\` ON \`_pages_v_blocks_section_heading\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_section_heading_path_idx\` ON \`_pages_v_blocks_section_heading\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_section_heading_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_section_heading\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_section_heading_locales_locale_parent_id_uni\` ON \`_pages_v_blocks_section_heading_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_section_heading_locales_parent_id_idx\` ON \`_pages_v_blocks_section_heading_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_team_members\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_team\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_team_members_order_idx\` ON \`_pages_v_blocks_team_members\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_team_members_parent_id_idx\` ON \`_pages_v_blocks_team_members\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_team_members_image_idx\` ON \`_pages_v_blocks_team_members\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_team_members_locales\` (
  	\`name\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_team_members\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_team_members_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_team_members_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_team_members_locales_parent_id_idx\` ON \`_pages_v_blocks_team_members_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_team\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'page',
  	\`link_page_id\` integer,
  	\`link_project_id\` integer,
  	\`link_url\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`link_project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_team_order_idx\` ON \`_pages_v_blocks_team\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_team_parent_id_idx\` ON \`_pages_v_blocks_team\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_team_path_idx\` ON \`_pages_v_blocks_team\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_team_link_link_page_idx\` ON \`_pages_v_blocks_team\` (\`link_page_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_team_link_link_project_idx\` ON \`_pages_v_blocks_team\` (\`link_project_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_team_locales\` (
  	\`heading\` text,
  	\`link_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_team\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_team_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_team_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_team_locales_parent_id_idx\` ON \`_pages_v_blocks_team_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_image_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`height\` text DEFAULT 'natural',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_image_banner_order_idx\` ON \`_pages_v_blocks_image_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_image_banner_parent_id_idx\` ON \`_pages_v_blocks_image_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_image_banner_path_idx\` ON \`_pages_v_blocks_image_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_image_banner_image_idx\` ON \`_pages_v_blocks_image_banner\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_featured_projects\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'page',
  	\`link_page_id\` integer,
  	\`link_project_id\` integer,
  	\`link_url\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`link_project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_featured_projects_order_idx\` ON \`_pages_v_blocks_featured_projects\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_featured_projects_parent_id_idx\` ON \`_pages_v_blocks_featured_projects\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_featured_projects_path_idx\` ON \`_pages_v_blocks_featured_projects\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_featured_projects_link_link_page_idx\` ON \`_pages_v_blocks_featured_projects\` (\`link_page_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_featured_projects_link_link_project_idx\` ON \`_pages_v_blocks_featured_projects\` (\`link_project_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_featured_projects_locales\` (
  	\`heading\` text,
  	\`link_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_featured_projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_featured_projects_locales_locale_parent_id_u\` ON \`_pages_v_blocks_featured_projects_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_featured_projects_locales_parent_id_idx\` ON \`_pages_v_blocks_featured_projects_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_projects_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`source\` text DEFAULT 'all',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_projects_grid_order_idx\` ON \`_pages_v_blocks_projects_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_projects_grid_parent_id_idx\` ON \`_pages_v_blocks_projects_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_projects_grid_path_idx\` ON \`_pages_v_blocks_projects_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_testimonial\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'page',
  	\`link_page_id\` integer,
  	\`link_project_id\` integer,
  	\`link_url\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`link_project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_testimonial_order_idx\` ON \`_pages_v_blocks_testimonial\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_testimonial_parent_id_idx\` ON \`_pages_v_blocks_testimonial\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_testimonial_path_idx\` ON \`_pages_v_blocks_testimonial\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_testimonial_link_link_page_idx\` ON \`_pages_v_blocks_testimonial\` (\`link_page_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_testimonial_link_link_project_idx\` ON \`_pages_v_blocks_testimonial\` (\`link_project_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_testimonial_locales\` (
  	\`quote\` text,
  	\`author\` text,
  	\`link_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_testimonial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_testimonial_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_testimonial_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_testimonial_locales_parent_id_idx\` ON \`_pages_v_blocks_testimonial_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_instagram\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_instagram_order_idx\` ON \`_pages_v_blocks_instagram\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_instagram_parent_id_idx\` ON \`_pages_v_blocks_instagram\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_instagram_path_idx\` ON \`_pages_v_blocks_instagram\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_instagram_image_idx\` ON \`_pages_v_blocks_instagram\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_instagram_locales\` (
  	\`heading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_instagram\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_instagram_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_instagram_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_instagram_locales_parent_id_idx\` ON \`_pages_v_blocks_instagram_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_tiles_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`kind\` text DEFAULT 'image',
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_tiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_tiles_items_order_idx\` ON \`_pages_v_blocks_tiles_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_tiles_items_parent_id_idx\` ON \`_pages_v_blocks_tiles_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_tiles_items_image_idx\` ON \`_pages_v_blocks_tiles_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_tiles_items_locales\` (
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_tiles_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_tiles_items_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_tiles_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_tiles_items_locales_parent_id_idx\` ON \`_pages_v_blocks_tiles_items_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_tiles\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_tiles_order_idx\` ON \`_pages_v_blocks_tiles\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_tiles_parent_id_idx\` ON \`_pages_v_blocks_tiles\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_tiles_path_idx\` ON \`_pages_v_blocks_tiles\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_lead\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_lead_order_idx\` ON \`_pages_v_blocks_lead\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_lead_parent_id_idx\` ON \`_pages_v_blocks_lead\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_lead_path_idx\` ON \`_pages_v_blocks_lead\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_lead_locales\` (
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_lead\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_lead_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_lead_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_lead_locales_parent_id_idx\` ON \`_pages_v_blocks_lead_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`button_type\` text DEFAULT 'page',
  	\`button_page_id\` integer,
  	\`button_project_id\` integer,
  	\`button_url\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`button_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`button_project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_rich_text_order_idx\` ON \`_pages_v_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_rich_text_parent_id_idx\` ON \`_pages_v_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_rich_text_path_idx\` ON \`_pages_v_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_rich_text_button_button_page_idx\` ON \`_pages_v_blocks_rich_text\` (\`button_page_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_rich_text_button_button_project_idx\` ON \`_pages_v_blocks_rich_text\` (\`button_project_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_rich_text_locales\` (
  	\`heading\` text,
  	\`content\` text,
  	\`button_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_rich_text\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_rich_text_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_rich_text_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_rich_text_locales_parent_id_idx\` ON \`_pages_v_blocks_rich_text_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_faq_items_order_idx\` ON \`_pages_v_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_faq_items_parent_id_idx\` ON \`_pages_v_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_faq_items_locales\` (
  	\`question\` text,
  	\`answer\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_faq_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_faq_items_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_faq_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_faq_items_locales_parent_id_idx\` ON \`_pages_v_blocks_faq_items_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_faq_order_idx\` ON \`_pages_v_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_faq_parent_id_idx\` ON \`_pages_v_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_faq_path_idx\` ON \`_pages_v_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_faq_locales\` (
  	\`heading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_faq_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_faq_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_faq_locales_parent_id_idx\` ON \`_pages_v_blocks_faq_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_collage\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`columns\` text DEFAULT '3',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_collage_order_idx\` ON \`_pages_v_blocks_collage\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_collage_parent_id_idx\` ON \`_pages_v_blocks_collage\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_collage_path_idx\` ON \`_pages_v_blocks_collage\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_contact_form\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_contact_form_order_idx\` ON \`_pages_v_blocks_contact_form\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_contact_form_parent_id_idx\` ON \`_pages_v_blocks_contact_form\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_contact_form_path_idx\` ON \`_pages_v_blocks_contact_form\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_contact_form_locales\` (
  	\`intro\` text,
  	\`success_heading\` text,
  	\`success_text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_contact_form\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_contact_form_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_contact_form_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_contact_form_locales_parent_id_idx\` ON \`_pages_v_blocks_contact_form_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'page',
  	\`link_page_id\` integer,
  	\`link_project_id\` integer,
  	\`link_url\` text,
  	\`style\` text DEFAULT 'solid',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`link_project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_order_idx\` ON \`_pages_v_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_parent_id_idx\` ON \`_pages_v_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_path_idx\` ON \`_pages_v_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_link_link_page_idx\` ON \`_pages_v_blocks_cta\` (\`link_page_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_link_link_project_idx\` ON \`_pages_v_blocks_cta\` (\`link_project_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cta_locales\` (
  	\`link_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_cta_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_cta_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_locales_parent_id_idx\` ON \`_pages_v_blocks_cta_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_slug\` text,
  	\`version_seo_image_id\` integer,
  	\`version_seo_noindex\` integer DEFAULT false,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_parent_idx\` ON \`_pages_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_slug_idx\` ON \`_pages_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_seo_version_seo_image_idx\` ON \`_pages_v\` (\`version_seo_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_updated_at_idx\` ON \`_pages_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_created_at_idx\` ON \`_pages_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version__status_idx\` ON \`_pages_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_created_at_idx\` ON \`_pages_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_updated_at_idx\` ON \`_pages_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_snapshot_idx\` ON \`_pages_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_published_locale_idx\` ON \`_pages_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_latest_idx\` ON \`_pages_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_locales\` (
  	\`version_title\` text,
  	\`version_seo_title\` text,
  	\`version_seo_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_locales_locale_parent_id_unique\` ON \`_pages_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_locales_parent_id_idx\` ON \`_pages_v_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`projects_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_order_idx\` ON \`_pages_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_parent_idx\` ON \`_pages_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_path_idx\` ON \`_pages_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_projects_id_idx\` ON \`_pages_v_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_media_id_idx\` ON \`_pages_v_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_collage\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`columns\` text DEFAULT '3',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_collage_order_idx\` ON \`projects_blocks_collage\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_collage_parent_id_idx\` ON \`projects_blocks_collage\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_collage_path_idx\` ON \`projects_blocks_collage\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_lead\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_lead_order_idx\` ON \`projects_blocks_lead\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_lead_parent_id_idx\` ON \`projects_blocks_lead\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_lead_path_idx\` ON \`projects_blocks_lead\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_lead_locales\` (
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_blocks_lead\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_blocks_lead_locales_locale_parent_id_unique\` ON \`projects_blocks_lead_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_lead_locales_parent_id_idx\` ON \`projects_blocks_lead_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`button_type\` text DEFAULT 'page',
  	\`button_page_id\` integer,
  	\`button_project_id\` integer,
  	\`button_url\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`button_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`button_project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_rich_text_order_idx\` ON \`projects_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_rich_text_parent_id_idx\` ON \`projects_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_rich_text_path_idx\` ON \`projects_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_rich_text_button_button_page_idx\` ON \`projects_blocks_rich_text\` (\`button_page_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_rich_text_button_button_project_idx\` ON \`projects_blocks_rich_text\` (\`button_project_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_rich_text_locales\` (
  	\`heading\` text,
  	\`content\` text,
  	\`button_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_blocks_rich_text\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_blocks_rich_text_locales_locale_parent_id_unique\` ON \`projects_blocks_rich_text_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_rich_text_locales_parent_id_idx\` ON \`projects_blocks_rich_text_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_image_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`height\` text DEFAULT 'natural',
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_image_banner_order_idx\` ON \`projects_blocks_image_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_image_banner_parent_id_idx\` ON \`projects_blocks_image_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_image_banner_path_idx\` ON \`projects_blocks_image_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_image_banner_image_idx\` ON \`projects_blocks_image_banner\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`projects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`date\` text,
  	\`cover_id\` integer,
  	\`seo_image_id\` integer,
  	\`seo_noindex\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_slug_idx\` ON \`projects\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`projects_cover_idx\` ON \`projects\` (\`cover_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_seo_seo_image_idx\` ON \`projects\` (\`seo_image_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_updated_at_idx\` ON \`projects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`projects_created_at_idx\` ON \`projects\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`projects__status_idx\` ON \`projects\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`projects_locales\` (
  	\`title\` text,
  	\`venue\` text,
  	\`location\` text,
  	\`season\` text,
  	\`excerpt\` text,
  	\`seo_title\` text,
  	\`seo_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_locales_locale_parent_id_unique\` ON \`projects_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_locales_parent_id_idx\` ON \`projects_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_rels_order_idx\` ON \`projects_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_parent_idx\` ON \`projects_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_path_idx\` ON \`projects_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_media_id_idx\` ON \`projects_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_collage\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`columns\` text DEFAULT '3',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_collage_order_idx\` ON \`_projects_v_blocks_collage\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_collage_parent_id_idx\` ON \`_projects_v_blocks_collage\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_collage_path_idx\` ON \`_projects_v_blocks_collage\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_lead\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_lead_order_idx\` ON \`_projects_v_blocks_lead\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_lead_parent_id_idx\` ON \`_projects_v_blocks_lead\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_lead_path_idx\` ON \`_projects_v_blocks_lead\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_lead_locales\` (
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_blocks_lead\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_projects_v_blocks_lead_locales_locale_parent_id_unique\` ON \`_projects_v_blocks_lead_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_lead_locales_parent_id_idx\` ON \`_projects_v_blocks_lead_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`button_type\` text DEFAULT 'page',
  	\`button_page_id\` integer,
  	\`button_project_id\` integer,
  	\`button_url\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`button_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`button_project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_rich_text_order_idx\` ON \`_projects_v_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_rich_text_parent_id_idx\` ON \`_projects_v_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_rich_text_path_idx\` ON \`_projects_v_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_rich_text_button_button_page_idx\` ON \`_projects_v_blocks_rich_text\` (\`button_page_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_rich_text_button_button_project_idx\` ON \`_projects_v_blocks_rich_text\` (\`button_project_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_rich_text_locales\` (
  	\`heading\` text,
  	\`content\` text,
  	\`button_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_blocks_rich_text\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_projects_v_blocks_rich_text_locales_locale_parent_id_unique\` ON \`_projects_v_blocks_rich_text_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_rich_text_locales_parent_id_idx\` ON \`_projects_v_blocks_rich_text_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_image_banner\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`height\` text DEFAULT 'natural',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_image_banner_order_idx\` ON \`_projects_v_blocks_image_banner\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_image_banner_parent_id_idx\` ON \`_projects_v_blocks_image_banner\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_image_banner_path_idx\` ON \`_projects_v_blocks_image_banner\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_image_banner_image_idx\` ON \`_projects_v_blocks_image_banner\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_slug\` text,
  	\`version_date\` text,
  	\`version_cover_id\` integer,
  	\`version_seo_image_id\` integer,
  	\`version_seo_noindex\` integer DEFAULT false,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_parent_idx\` ON \`_projects_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_slug_idx\` ON \`_projects_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_cover_idx\` ON \`_projects_v\` (\`version_cover_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_seo_version_seo_image_idx\` ON \`_projects_v\` (\`version_seo_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_updated_at_idx\` ON \`_projects_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_created_at_idx\` ON \`_projects_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version__status_idx\` ON \`_projects_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_created_at_idx\` ON \`_projects_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_updated_at_idx\` ON \`_projects_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_snapshot_idx\` ON \`_projects_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_published_locale_idx\` ON \`_projects_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_latest_idx\` ON \`_projects_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_locales\` (
  	\`version_title\` text,
  	\`version_venue\` text,
  	\`version_location\` text,
  	\`version_season\` text,
  	\`version_excerpt\` text,
  	\`version_seo_title\` text,
  	\`version_seo_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_projects_v_locales_locale_parent_id_unique\` ON \`_projects_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_locales_parent_id_idx\` ON \`_projects_v_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_order_idx\` ON \`_projects_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_parent_idx\` ON \`_projects_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_path_idx\` ON \`_projects_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_media_id_idx\` ON \`_projects_v_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumbnail_url\` text,
  	\`sizes_thumbnail_width\` numeric,
  	\`sizes_thumbnail_height\` numeric,
  	\`sizes_thumbnail_mime_type\` text,
  	\`sizes_thumbnail_filesize\` numeric,
  	\`sizes_thumbnail_filename\` text,
  	\`sizes_xlarge_url\` text,
  	\`sizes_xlarge_width\` numeric,
  	\`sizes_xlarge_height\` numeric,
  	\`sizes_xlarge_mime_type\` text,
  	\`sizes_xlarge_filesize\` numeric,
  	\`sizes_xlarge_filename\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`media\` (\`sizes_thumbnail_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_xlarge_sizes_xlarge_filename_idx\` ON \`media\` (\`sizes_xlarge_filename\`);`)
  await db.run(sql`CREATE TABLE \`media_locales\` (
  	\`alt\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`media_locales_locale_parent_id_unique\` ON \`media_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`media_locales_parent_id_idx\` ON \`media_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`submissions_type_of_services\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`submissions_type_of_services_order_idx\` ON \`submissions_type_of_services\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`submissions_type_of_services_parent_idx\` ON \`submissions_type_of_services\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`submissions_origin\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`submissions_origin_order_idx\` ON \`submissions_origin\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`submissions_origin_parent_idx\` ON \`submissions_origin\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`submissions\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`status\` text DEFAULT 'new' NOT NULL,
  	\`name\` text NOT NULL,
  	\`email\` text NOT NULL,
  	\`phone\` text,
  	\`wedding_date\` text,
  	\`wedding_location\` text,
  	\`wedding_notes\` text,
  	\`message\` text,
  	\`number_of_guests\` text,
  	\`locale\` text,
  	\`ip\` text,
  	\`user_agent\` text,
  	\`email_sent\` integer DEFAULT false,
  	\`email_error\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`submissions_status_idx\` ON \`submissions\` (\`status\`);`)
  await db.run(sql`CREATE INDEX \`submissions_updated_at_idx\` ON \`submissions\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`submissions_created_at_idx\` ON \`submissions\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`role\` text DEFAULT 'editor' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`enable_a_p_i_key\` integer,
  	\`api_key\` text,
  	\`api_key_index\` text,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`reset_password_requested_at\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`projects_id\` integer,
  	\`media_id\` integer,
  	\`submissions_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`submissions_id\`) REFERENCES \`submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_projects_id_idx\` ON \`payload_locked_documents_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`submissions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`logo_id\` integer,
  	\`contact_email\` text,
  	\`phone\` text,
  	\`social_instagram\` text,
  	\`social_facebook\` text,
  	\`default_seo_image_id\` integer,
  	\`privacy_page_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`default_seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`privacy_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_logo_idx\` ON \`site_settings\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_default_seo_default_seo_image_idx\` ON \`site_settings\` (\`default_seo_image_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_privacy_page_idx\` ON \`site_settings\` (\`privacy_page_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_locales\` (
  	\`site_name\` text DEFAULT 'Nishki' NOT NULL,
  	\`default_seo_title\` text,
  	\`default_seo_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`site_settings_locales_locale_parent_id_unique\` ON \`site_settings_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_locales_parent_id_idx\` ON \`site_settings_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_logo_id\` integer,
  	\`version_contact_email\` text,
  	\`version_phone\` text,
  	\`version_social_instagram\` text,
  	\`version_social_facebook\` text,
  	\`version_default_seo_image_id\` integer,
  	\`version_privacy_page_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`version_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_default_seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_privacy_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version_logo_idx\` ON \`_site_settings_v\` (\`version_logo_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_default_seo_version_default_seo_idx\` ON \`_site_settings_v\` (\`version_default_seo_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version_privacy_page_idx\` ON \`_site_settings_v\` (\`version_privacy_page_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_created_at_idx\` ON \`_site_settings_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_updated_at_idx\` ON \`_site_settings_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v_locales\` (
  	\`version_site_name\` text DEFAULT 'Nishki' NOT NULL,
  	\`version_default_seo_title\` text,
  	\`version_default_seo_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_site_settings_v_locales_locale_parent_id_unique\` ON \`_site_settings_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_locales_parent_id_idx\` ON \`_site_settings_v_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_header_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'page',
  	\`link_page_id\` integer,
  	\`link_project_id\` integer,
  	\`link_url\` text,
  	FOREIGN KEY (\`link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`link_project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`navigation_header_items_order_idx\` ON \`navigation_header_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`navigation_header_items_parent_id_idx\` ON \`navigation_header_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`navigation_header_items_link_link_page_idx\` ON \`navigation_header_items\` (\`link_page_id\`);`)
  await db.run(sql`CREATE INDEX \`navigation_header_items_link_link_project_idx\` ON \`navigation_header_items\` (\`link_project_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_header_items_locales\` (
  	\`link_label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation_header_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`navigation_header_items_locales_locale_parent_id_unique\` ON \`navigation_header_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`navigation_header_items_locales_parent_id_idx\` ON \`navigation_header_items_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`header_cta_type\` text DEFAULT 'page',
  	\`header_cta_page_id\` integer,
  	\`header_cta_project_id\` integer,
  	\`header_cta_url\` text,
  	\`footer_cta_type\` text DEFAULT 'page',
  	\`footer_cta_page_id\` integer,
  	\`footer_cta_project_id\` integer,
  	\`footer_cta_url\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`header_cta_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`header_cta_project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`footer_cta_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`footer_cta_project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`navigation_header_cta_header_cta_page_idx\` ON \`navigation\` (\`header_cta_page_id\`);`)
  await db.run(sql`CREATE INDEX \`navigation_header_cta_header_cta_project_idx\` ON \`navigation\` (\`header_cta_project_id\`);`)
  await db.run(sql`CREATE INDEX \`navigation_footer_cta_footer_cta_page_idx\` ON \`navigation\` (\`footer_cta_page_id\`);`)
  await db.run(sql`CREATE INDEX \`navigation_footer_cta_footer_cta_project_idx\` ON \`navigation\` (\`footer_cta_project_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_locales\` (
  	\`header_cta_label\` text,
  	\`footer_cta_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`navigation_locales_locale_parent_id_unique\` ON \`navigation_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`navigation_locales_parent_id_idx\` ON \`navigation_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`build_status\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`state\` text DEFAULT 'idle',
  	\`queued\` integer DEFAULT false,
  	\`started_at\` text,
  	\`finished_at\` text,
  	\`last_success_at\` text,
  	\`triggered_by\` text,
  	\`message\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pages_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_hero_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_tagline\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_tagline_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_section_heading\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_section_heading_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_team_members\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_team_members_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_team\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_team_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_image_banner\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_featured_projects\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_featured_projects_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_projects_grid\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_testimonial\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_testimonial_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_instagram\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_instagram_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_tiles_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_tiles_items_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_tiles\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_lead\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_lead_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_rich_text_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_faq_items_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_faq_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_collage\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_contact_form\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_contact_form_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cta_locales\`;`)
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`DROP TABLE \`pages_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_rels\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_hero_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_tagline\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_tagline_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_section_heading\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_section_heading_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_team_members\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_team_members_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_team\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_team_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_image_banner\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_featured_projects\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_featured_projects_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_projects_grid\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_testimonial\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_testimonial_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_instagram\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_instagram_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_tiles_items\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_tiles_items_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_tiles\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_lead\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_lead_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_rich_text_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_faq_items_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_faq_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_collage\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_contact_form\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_contact_form_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cta_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_rels\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_collage\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_lead\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_lead_locales\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_rich_text_locales\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_image_banner\`;`)
  await db.run(sql`DROP TABLE \`projects\`;`)
  await db.run(sql`DROP TABLE \`projects_locales\`;`)
  await db.run(sql`DROP TABLE \`projects_rels\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_collage\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_lead\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_lead_locales\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_rich_text_locales\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_image_banner\`;`)
  await db.run(sql`DROP TABLE \`_projects_v\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_rels\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`media_locales\`;`)
  await db.run(sql`DROP TABLE \`submissions_type_of_services\`;`)
  await db.run(sql`DROP TABLE \`submissions_origin\`;`)
  await db.run(sql`DROP TABLE \`submissions\`;`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings_locales\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_locales\`;`)
  await db.run(sql`DROP TABLE \`navigation_header_items\`;`)
  await db.run(sql`DROP TABLE \`navigation_header_items_locales\`;`)
  await db.run(sql`DROP TABLE \`navigation\`;`)
  await db.run(sql`DROP TABLE \`navigation_locales\`;`)
  await db.run(sql`DROP TABLE \`build_status\`;`)
}
