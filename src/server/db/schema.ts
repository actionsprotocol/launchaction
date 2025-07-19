import {
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const mentions = pgTable('mentions', {
  tweetId: varchar('tweet_id', { length: 256 }).primaryKey(),
  userId: varchar('user_id', { length: 256 }).notNull(),
  createdAt: timestamp('created_at').notNull(),
  text: text('text').notNull(),
  handled: boolean('handled').notNull().default(false),
  handledAt: timestamp('handled_at'),
});

export const users = pgTable('users', {
  id: varchar('id', { length: 256 }).primaryKey(),
  name: text('name').notNull(),
  username: varchar('username', { length: 256 }).notNull(),
  verified: boolean('verified').notNull().default(false),
  profileImageUrl: text('profile_image_url'),
  verifiedFollowersCount: integer('verified_followers_count')
    .notNull()
    .default(0),
});

export const jobTypeEnum = pgEnum('job_type', ['search_mentions', 'process_mentions']);
export const jobStatusEnum = pgEnum('job_status', ['pending', 'running', 'completed', 'failed']);
export type JobType = typeof jobTypeEnum.enumValues[number];
export type JobStatus = typeof jobStatusEnum.enumValues[number];
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;

export const jobs = pgTable('jobs', {
  id: varchar('id', { length: 256 }).primaryKey(),
  type: jobTypeEnum('type').notNull(),
  status: jobStatusEnum('status').notNull().default('pending'),
  startedAt: timestamp('started_at'),
  tweetsConsumed: integer('tweets_consumed').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
