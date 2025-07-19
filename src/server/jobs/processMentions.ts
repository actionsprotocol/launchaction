import 'dotenv/config';
import { Job } from '../db/schema';
import { 
  markJobAsStarted, 
  markJobAsCompleted, 
  markJobAsFailed,
  getUnhandledMentions,
  markMentionAsHandled
} from '../db';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function performProcessMentionsJob(job: Job) {
  try {
    await markJobAsStarted(job.id);

    const unhandledMentions = await getUnhandledMentions(50);
    
    let processedCount = 0;

    for (const mention of unhandledMentions) {
      await delay(300);
      
      await markMentionAsHandled(mention.tweetId);
      
      processedCount++;
    }

    await markJobAsCompleted(
      job.id,
      processedCount
    );

    return {
      success: true,
      processedCount,
      totalUnhandled: unhandledMentions.length,
    };
  } catch (error) {
    await markJobAsFailed(job.id);
    throw error;
  }
}
