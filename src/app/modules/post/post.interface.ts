import { Model, Types } from 'mongoose';
import { CREATOR_TYPE, POST_TYPE } from './post.constant';

export type IPOST = {
  description?: string;
  image?: string;
  media?: string;
  creator?: Types.ObjectId;
  creator_type: CREATOR_TYPE;
  club?: Types.ObjectId;
  tag_user?: Types.ObjectId[];
  features_skills?: string[];
  post_type: POST_TYPE;
  createdAt?: Date;
  updatedAt?: Date;
};

export type IPostModel = Model<IPOST>;
