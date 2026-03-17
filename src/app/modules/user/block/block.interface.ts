import mongoose, { Model, Types } from 'mongoose';
import { IUser } from '../user.interface';
import { IPOST } from '../../post/post.interface';

export interface IUserBlock extends Document {
  blocker: mongoose.Types.ObjectId;
  blocked: mongoose.Types.ObjectId;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}
export type UserBlockModel = Model<IUserBlock>;
