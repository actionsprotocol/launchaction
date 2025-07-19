import { twitterClient } from './client';

export async function replyToTweet(
  tweetId: string,
  text: string
) {
  const response = await twitterClient.v2.reply(text, tweetId);
  return response.data;
}
