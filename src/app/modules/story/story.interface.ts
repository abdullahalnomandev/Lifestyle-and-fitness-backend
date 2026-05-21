import { Model, Types } from 'mongoose';
import { USER_STORY_TYPE } from './story.constant';

export type IStory = {
  creator?: Types.ObjectId;
  type?: USER_STORY_TYPE;
  caption?: string;
  image?: string;
  media?: string;
  text_x?: number;
  text_y?: number;
  text_scale?: number;
  text_rotation?: number;
  text_color?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type IStoryModel = Model<IStory>;
