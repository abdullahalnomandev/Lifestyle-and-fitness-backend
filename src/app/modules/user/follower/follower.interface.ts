import { Model, Types } from 'mongoose';
import { IUser } from '../../user/user.interface';

export type IFollower = {
  _id?: Types.ObjectId;
  follower: Types.ObjectId | IUser;
  following: Types.ObjectId | IUser;
  createdAt?: Date;
  updatedAt?: Date;
};

export type FollowerModel = Model<IFollower>;
