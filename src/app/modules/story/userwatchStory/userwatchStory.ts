import { Model, Types } from 'mongoose';
import { IUser } from '../../user/user.interface';

export type IStory = {
  story: Types.ObjectId | IStory;
  user: Types.ObjectId | IUser;
  createdAt?: Date;
  updatedAt?: Date;
};

export type StoryModel = Model<IStory>;
