import { Model, Types } from 'mongoose';
import { USER_POST_TYPE } from './post.constant';

export type IPOST = {
  creator?: Types.ObjectId;
  type?:USER_POST_TYPE;
  caption?: string;
  image?: String[];
  media?: String[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type IPostModel = Model<IPOST>;
