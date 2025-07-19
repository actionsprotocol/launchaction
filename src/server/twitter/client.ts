import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config();

export const twitterAppClient = new TwitterApi(process.env.TWITTER_APP_AUTH_TOKEN!);

export const twitterUserClient = process.env.TWITTER_APP_API_KEY &&
  process.env.TWITTER_APP_API_KEY_SECRET &&
  process.env.TWITTER_APP_ACCESS_TOKEN &&
  process.env.TWITTER_APP_ACCESS_TOKEN_SECRET
  ? new TwitterApi({
      appKey: process.env.TWITTER_APP_API_KEY,
      appSecret: process.env.TWITTER_APP_API_KEY_SECRET,
      accessToken: process.env.TWITTER_APP_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_APP_ACCESS_TOKEN_SECRET,
    })
  : null;
