import 'dotenv/config';
import { Job } from '../db/schema';
import { 
  markJobAsStarted, 
  markJobAsCompleted, 
  markJobAsFailed,
  getLatestMention,
  upsertMention,
  upsertUser
} from '../db';
import { fetchUserMentionsTimeline } from '../twitter';

export async function performSearchMentionsJob(job: Job, userId: string) {
  try {
    await markJobAsStarted(job.id);

    const latestMention = await getLatestMention();
    const sinceId = latestMention.length > 0 ? latestMention[0].tweetId : undefined;

    const mentions = await fetchUserMentionsTimeline(
      userId,
      100,
      sinceId
    );

    let tweetsConsumed = 0;

    for (const mention of mentions.mentions) {
      await upsertUser({
        id: mention.user.id,
        name: mention.user.name,
        username: mention.user.username,
        verified: mention.user.verified,
        profileImageUrl: mention.user.profileImageUrl,
        verifiedFollowersCount: mention.user.verifiedFollowersCount,
      });

      await upsertMention({
        tweetId: mention.tweetId,
        userId: mention.user.id,
        createdAt: mention.createdAt,
        text: mention.text,
      });

      tweetsConsumed++;
    }

    await markJobAsCompleted(
      job.id,
      tweetsConsumed
    );

    return {
      success: true,
      tweetsConsumed,
      mentionsFound: mentions.mentions.length,
    };
  } catch (error) {
    console.error(error);
    await markJobAsFailed(job.id);
  }
}
