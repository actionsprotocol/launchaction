import { twitterAppClient } from './client';

export async function fetchUserMentionsTimeline(
  userId: string,
  limit?: number,
  sinceId?: string
) {
  const response = await twitterAppClient.v2.userMentionTimeline(userId, {
    'user.fields': ['id', 'name', 'username', 'verified', 'profile_image_url', 'public_metrics'],
    'tweet.fields': ['author_id', 'text', 'entities', 'referenced_tweets', 'in_reply_to_user_id', 'conversation_id', 'created_at'],
    expansions: ['author_id', 'referenced_tweets.id', 'entities.mentions.username', 'in_reply_to_user_id'],
    max_results: limit,
    since_id: sinceId,
  });

  const mentions = [];
  const usersMap = new Map();

  if (response.includes?.users) {
    for (const user of response.includes.users) {
      usersMap.set(user.id, user);
    }
  }

  for (const tweet of response.tweets) {
    const author = usersMap.get(tweet.author_id);
    
    let isDirectMention = false;
    
    if (tweet.entities?.mentions) {
      isDirectMention = tweet.entities.mentions.some(mention =>
        mention.username.toLowerCase() === 'launchaction'
      );
    }

    if (isDirectMention) {
      mentions.push({
        tweetId: tweet.id,
        userId: tweet.author_id,
        createdAt: new Date(tweet.created_at!),
        text: tweet.text,
        user: {
          id: author.id,
          name: author.name,
          username: author.username,
          verified: author.verified || false,
          profileImageUrl: author.profile_image_url,
          verifiedFollowersCount: author.public_metrics?.followers_count || 0,
        },
      });
    }
  }

  return {
    mentions: mentions,
    rateLimit: response.rateLimit.remaining,
    rateLimitReset: response.rateLimit.reset,
  };
}
