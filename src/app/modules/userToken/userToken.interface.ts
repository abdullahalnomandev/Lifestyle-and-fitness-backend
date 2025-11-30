import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';

export type IUserToken = {
  user: Types.ObjectId | IUser;
  numberOfToken: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UserTokenModel = Model<IUserToken>;
