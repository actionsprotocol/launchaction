import { twitterClient } from './client';

export async function fetchUserMentionsTimeline(
  userId: string,
  limit?: number,
  sinceId?: string
) {
  const response = await twitterClient.v2.userMentionTimeline(userId, {
    'tweet.fields': ['id', 'text', 'created_at', 'author_id'],
    'user.fields': ['id', 'name', 'username', 'verified', 'profile_image_url', 'public_metrics'],
    expansions: ['author_id'],
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

  return mentions;
} 