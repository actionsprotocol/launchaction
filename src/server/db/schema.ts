import {
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';

export const mentions = pgTable('mentions', {
  tweetId: varchar('tweet_id', { length: 256 }).primaryKey(),
  userId: varchar('user_id', { length: 256 }).notNull(),
  createdAt: timestamp('created_at').notNull(),
  text: text('text').notNull(),
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

export const jobs = pgTable('jobs', {
  id: varchar('id', { length: 256 }).primaryKey(),
  type: varchar('type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  startedAt: timestamp('started_at'),
  rateLimitRemaining: integer('rate_limit_remaining'),
  rateLimitReset: timestamp('rate_limit_reset'),
  tweetsConsumed: integer('tweets_consumed').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
