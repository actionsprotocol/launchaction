import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config();

export const twitterClient = new TwitterApi(process.env.TWITTER_APP_AUTH_TOKEN!);
