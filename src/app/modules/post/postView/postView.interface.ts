import { Model, Types } from 'mongoose';
import { IUser } from '../../user/user.interface';
import { IPOST } from '../post.interface';

export type IPostView = {
  video: Types.ObjectId | IPOST;
  user: Types.ObjectId | IUser;
  createdAt?: Date;
  updatedAt?: Date;
};

export type PostViewModel = Model<IPostView>;
