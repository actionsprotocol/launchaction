import 'dotenv/config';
import {
  getHandledMentions,
  getUnhandledMentions,
  markJobAsCompleted,
  markJobAsFailed,
  markJobAsStarted,
  markMentionAsHandled,
} from '../db';
import { Job } from '../db/schema';
import { replyToTweet } from '../twitter';

interface ProcessingResult {
  success: boolean;
  processedCount: number;
}

// Twitter allows to send 100 tweets per 24h.
const MAX_REPLIES_PER_24H = 100;

export async function performProcessMentionsJob(job: Job): Promise<ProcessingResult> {
  await markJobAsStarted(job.id);

  try {
    const unhandledMentions = await getUnhandledMentions(50);
    const repliesSentToday = await numberOfSentRepliesToday(MAX_REPLIES_PER_24H);
    const repliesLeft = MAX_REPLIES_PER_24H - repliesSentToday;

    let processedCount = 0;

    for (const mention of unhandledMentions) {
      if (processedCount + 1 == repliesLeft) {
        break;
      }

      try {
        // TODO
        await replyToTweet(mention.tweetId, `hello`);
        await markMentionAsHandled(mention.tweetId);
        
        processedCount++;
      } catch (error) {
        await markJobAsFailed(job.id);
        console.error(`Failed to process mention ${mention.tweetId}:`, error);
      }
    }

    await markJobAsCompleted(
      job.id,
      processedCount,
    );

    return {
      success: true,
      processedCount,
    };
  } catch (error) {
    await markJobAsFailed(job.id);
    throw error;
  }
}

async function numberOfSentRepliesToday(maxReplies: number): Promise<number> {
  const sentReplies = await getHandledMentions(maxReplies);
  
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentReplies = sentReplies.filter(mention => 
    mention.handledAt && new Date(mention.handledAt) > twentyFourHoursAgo
  );
  
  return recentReplies.length;
}