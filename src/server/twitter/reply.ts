import { twitterUserClient } from './client';

export async function replyToTweet(
  tweetId: string,
  text: string
) {
  if (!twitterUserClient) {
    throw new Error(
      'Twitter user authentication not configured. ' +
      'Please set TWITTER_API_KEY, TWITTER_API_SECRET, ' +
      'TWITTER_ACCESS_TOKEN, and TWITTER_ACCESS_TOKEN_SECRET environment variables.'
    );
  }

  const response = await twitterUserClient.readWrite.v2.reply(text, tweetId);
  return response.data;
}
