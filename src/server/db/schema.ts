import { pgTable, text, timestamp, varchar, boolean, integer } from 'drizzle-orm/pg-core';

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
  verifiedFollowersCount: integer('verified_followers_count').notNull().default(0),
}); 