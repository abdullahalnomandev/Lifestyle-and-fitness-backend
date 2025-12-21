import { Model, Types } from 'mongoose';
import { IUser } from '../../user/user.interface';

export type IFavourite = {
  user: Types.ObjectId | IUser;
  handle: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type FavouriteModel = Model<IFavourite>;
