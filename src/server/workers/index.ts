import { rescheduleJobs, claimNextJob } from '../db';
import { performSearchMentionsJob, performProcessMentionsJob } from '../jobs';

async function setupSearchMentionsWorker(userId: string) {
  const interval = 1000 * 60; // Every minute

  await rescheduleJobs('search_mentions');

  setInterval(async () => {
    try {
      const job = await claimNextJob('search_mentions');
      if (!job) {
        console.log('No search mentions job available');
        return;
      }

      console.log('Executing search mentions job', job.id);
      await performSearchMentionsJob(job, userId);
    } catch (error) {
      console.error('Error in search mentions worker:', error);
    }
  }, interval);
}

async function setupProcessMentionsWorker() {
  const interval = 1000 * 30; // Every 30sec

  await rescheduleJobs('process_mentions');

  setInterval(async () => {
    try {
      const job = await claimNextJob('process_mentions');
      if (!job) {
        console.log('No process mentions job available');
        return;
      }

      console.log('Executing process mentions job', job.id);
      await performProcessMentionsJob(job);
    } catch (error) {
      console.error('Error in process mentions worker:', error);
    }
  }, interval);
}

export async function setupWorkers(userId: string) {
  await setupSearchMentionsWorker(userId);
  await setupProcessMentionsWorker();
}
