import 'dotenv/config';
import { and, desc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
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

export const getLatestMention = async () => {
  return db
    .select()
    .from(schema.mentions)
    .orderBy(desc(schema.mentions.createdAt))
    .limit(1);
};

export const getUnhandledMentions = async (limit?: number) => {
  const query = db
    .select()
    .from(schema.mentions)
    .where(eq(schema.mentions.handled, false))
    .orderBy(schema.mentions.createdAt);

  if (limit) {
    return query.limit(limit);
  }

  return query;
};

export const markMentionAsHandled = async (tweetId: string) => {
  return db
    .update(schema.mentions)
    .set({ handled: true })
    .where(eq(schema.mentions.tweetId, tweetId))
    .returning();
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

export const createJob = async (type: schema.JobType) => {
  const { randomUUID } = await import('crypto');
  const [newJob] = await insertJob({
    id: randomUUID(),
    type,
    status: 'pending',
  });
  return newJob;
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

export const getLatestJobByType = async (type: schema.JobType) => {
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

export const rescheduleJobs = async (type: schema.JobType) => {
  return db
    .update(schema.jobs)
    .set({ status: 'pending' })
    .where(and(eq(schema.jobs.type, type), eq(schema.jobs.status, 'running')));
};

export const claimNextJob = async (type: schema.JobType) => {
  return await db.transaction(async (tx) => {
    const [job] = await tx
      .select()
      .from(schema.jobs)
      .where(and(
        eq(schema.jobs.status, 'pending'),
        eq(schema.jobs.type, type)
      ))
      .orderBy(schema.jobs.createdAt)
      .limit(1);

    if (!job) {
      return await createJob(type);
    }

    const [updatedJob] = await tx
      .update(schema.jobs)
      .set({ status: 'running', startedAt: new Date() })
      .where(eq(schema.jobs.id, job.id))
      .returning();

    return updatedJob;
  });
};

