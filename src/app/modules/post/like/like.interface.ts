import { Model, Types } from 'mongoose';
import { IUser } from '../../user/user.interface';
import { IPOST } from '../post.interface';

export type ILike = {
  post: Types.ObjectId | IPOST;
  user: Types.ObjectId | IUser;
  createdAt?: Date;
  updatedAt?: Date;
};

export type LikeModel = Model<ILike>;
