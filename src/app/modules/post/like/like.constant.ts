export const LIKE_REACTION = {
  LOVE: 'love',
  LIKE: 'like',
  HAHA: 'haha',
  WOW: 'wow',
  SAD: 'sad',
  ANGRY: 'angry',
} as const;

export type LIKE_REACTION_TYPE = typeof LIKE_REACTION[keyof typeof LIKE_REACTION];