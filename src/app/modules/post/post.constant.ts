export enum POST_TYPE {
  PHOTO = 'photo',
  VIDEO = 'video',
  TEXT = 'text',
  DRAFTS = 'drafts',
}

export enum CREATOR_TYPE {
  CLUB = 'club',
  USER = 'user',
}

export enum COMMENT_REACTION {
  LOVE = 'love',
}

export const MAX_FEATURES_SKILLS = 5;
export const MAX_TAGGED_USERS = 10;

export enum POST_SERCH_TYPE {
  PHOTO = 'photo',
  CLUB = 'club',
  USER = 'user',
  VIDEO = 'video',
  SKILL = 'skill',
}

export const postSearchableField = ["description","features_skills"];
export const clubSearchableField = ["name"];
export const userSearchableField = ["name","email"];
