import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, desc } from 'drizzle-orm';
import * as schema from './schema';

export const db = drizzle(process.env.POSTGRES_URL!);

export const insertMention = async (
  mention: typeof schema.mentions.$inferInsert,
) => {
  return db.insert(schema.mentions).values(mention).returning();
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
  return db.insert(schema.users).values(user).returning();
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

export const insertJob = async (job: typeof schema.jobs.$inferInsert) => {
  return db.insert(schema.jobs).values(job).returning();
};

export const updateJob = async (
  jobId: string,
  updates: Partial<typeof schema.jobs.$inferInsert>,
) => {
  return db
    .update(schema.jobs)
    .set(updates)
    .where(eq(schema.jobs.id, jobId))
    .returning();
};

export const getJobById = async (jobId: string) => {
  return db
    .select()
    .from(schema.jobs)
    .where(eq(schema.jobs.id, jobId))
    .limit(1);
};

export const getLatestJobByType = async (type: string) => {
  return db
    .select()
    .from(schema.jobs)
    .where(eq(schema.jobs.type, type))
    .orderBy(desc(schema.jobs.createdAt))
    .limit(1);
};

export const getRunningJobs = async () => {
  return db.select().from(schema.jobs).where(eq(schema.jobs.status, 'running'));
};

export const markJobAsStarted = async (jobId: string) => {
  return updateJob(jobId, {
    status: 'running',
    startedAt: new Date(),
  });
};

export const markJobAsCompleted = async (
  jobId: string,
  tweetsConsumed: number,
  rateLimitRemaining?: number,
  rateLimitReset?: Date,
) => {
  return updateJob(jobId, {
    status: 'completed',
    tweetsConsumed,
    rateLimitRemaining,
    rateLimitReset,
  });
};

export const markJobAsFailed = async (jobId: string) => {
  return updateJob(jobId, {
    status: 'failed',
  });
};
