import { Model, Types } from 'mongoose';

export type IPOST = {
  creator?: Types.ObjectId;
  caption?: string;
  image?: String[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type IPostModel = Model<IPOST>;
