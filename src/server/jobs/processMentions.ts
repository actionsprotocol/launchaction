import 'dotenv/config';
import { ApiResponseError } from 'twitter-api-v2';
import {
  getUnhandledMentions,
  markJobAsCompleted,
  markJobAsFailed,
  markJobAsStarted,
  markMentionAsHandled,
} from '../db';
import { Job } from '../db/schema';
import { replyToTweet } from '../twitter';

interface RateLimitState {
  remaining?: number;
  resetAt?: Date;
}

interface ProcessingResult {
  success: boolean;
  processedCount: number;
  totalUnhandled: number;
  rateLimitRemaining?: number;
  rateLimitReset?: Date;
}

async function createPoolFromMention(mention: { tweetId: string }): Promise<string> {
  return `https://example.com/pool/${mention.tweetId}`;
}

function isRateLimitExceeded(state: RateLimitState): boolean {
  if (state.remaining === undefined || state.remaining > 0) return false;
  if (!state.resetAt) return true;
  return new Date() < state.resetAt;
}

function extractRateLimitFromError(error: unknown): RateLimitState | null {
  if (!(error instanceof ApiResponseError) || !error.rateLimitError || !error.rateLimit) {
    return null;
  }
  
  return {
    remaining: error.rateLimit.remaining,
    resetAt: new Date(error.rateLimit.reset * 1000)
  };
}

export async function performProcessMentionsJob(job: Job): Promise<ProcessingResult> {
  await markJobAsStarted(job.id);

  try {
    const mentions = await getUnhandledMentions(50);
    const rateLimit: RateLimitState = {
      remaining: job.rateLimitRemaining ?? undefined,
      resetAt: job.rateLimitReset ?? undefined
    };
    
    let processedCount = 0;

    for (const mention of mentions) {
      if (isRateLimitExceeded(rateLimit)) break;
      
      try {
        const poolUrl = await createPoolFromMention(mention);
        await replyToTweet(mention.tweetId, `Your pool is ready: ${poolUrl}`);
        await markMentionAsHandled(mention.tweetId);
        
        processedCount++;
        if (rateLimit.remaining !== undefined) {
          rateLimit.remaining--;
        }
      } catch (error) {
        const limitFromError = extractRateLimitFromError(error);
        if (limitFromError) {
          Object.assign(rateLimit, limitFromError);
          break;
        }
        await markJobAsFailed(job.id);
        console.error(`Failed to process mention ${mention.tweetId}:`, error);
      }
    }

    await markJobAsCompleted(
      job.id,
      processedCount,
      rateLimit.remaining,
      rateLimit.resetAt
    );

    return {
      success: true,
      processedCount,
      totalUnhandled: mentions.length,
      rateLimitRemaining: rateLimit.remaining,
      rateLimitReset: rateLimit.resetAt
    };
  } catch (error) {
    await markJobAsFailed(job.id);
    throw error;
  }
}
