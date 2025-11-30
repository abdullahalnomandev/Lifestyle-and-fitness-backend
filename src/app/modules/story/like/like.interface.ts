import { Model, Types } from 'mongoose';
import { IUser } from '../../user/user.interface';
import { IStory } from '../story.interface';

export type IStoryLike = {
  story: Types.ObjectId | IStory;
  user: Types.ObjectId | IUser;
  createdAt?: Date;
  updatedAt?: Date;
};

export type StoryLikeModel = Model<IStoryLike>;

