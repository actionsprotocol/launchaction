import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from './schema';

export const db = drizzle(process.env.POSTGRES_URL!);

export const insertMention = async (
  mention: typeof schema.mentions.$inferInsert,
) => {
  return db.insert(schema.mentions)
           .values(mention)
           .returning();
};

export const upsertMention = async (
  mention: typeof schema.mentions.$inferInsert,
) => {
  return db
    .insert(schema.mentions)
    .values(mention)
    .onConflictDoUpdate({
      target: schema.mentions.tweetId,
      set: {
        userId: mention.userId,
        createdAt: mention.createdAt,
        text: mention.text,
      },
    })
    .returning();
};

export const getMentionById = async (tweetId: string) => {
  return db
    .select()
    .from(schema.mentions)
    .where(eq(schema.mentions.tweetId, tweetId))
    .limit(1);
};

export const getAllMentions = async () => {
  return db.select().from(schema.mentions);
};

export const insertUser = async (user: typeof schema.users.$inferInsert) => {
  return db.insert(schema.users)
           .values(user)
           .returning();
};

export const upsertUser = async (user: typeof schema.users.$inferInsert) => {
  return db
    .insert(schema.users)
    .values(user)
    .onConflictDoUpdate({
      target: schema.users.id,
      set: {
        name: user.name,
        username: user.username,
        verified: user.verified,
        profileImageUrl: user.profileImageUrl,
        verifiedFollowersCount: user.verifiedFollowersCount,
      },
    })
    .returning();
};

export const getUserById = async (userId: string) => {
  return db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
};

export const getAllUsers = async () => {
  return db.select().from(schema.users);
};

export const getMentionsWithUsers = async () => {
  return db
    .select({
      mention: schema.mentions,
      user: schema.users,
    })
    .from(schema.mentions)
    .leftJoin(schema.users, eq(schema.mentions.userId, schema.users.id));
};
