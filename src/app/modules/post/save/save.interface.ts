import { Model, Types } from 'mongoose';
import { IUser } from '../../user/user.interface';
import { IPOST } from '../post.interface';

export type ISave = {
  post: Types.ObjectId | IPOST;
  user: Types.ObjectId | IUser;
  createdAt?: Date;
  updatedAt?: Date;
};

export type SaveModel = Model<ISave>;
