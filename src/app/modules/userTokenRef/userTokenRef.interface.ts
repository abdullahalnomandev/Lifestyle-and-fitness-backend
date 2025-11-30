import { Model, mongo } from 'mongoose';

export type IUserTokenRef = {
  ref: mongo.ObjectId;
  user?: mongo.ObjectId;
};

export type IUserTokenRefModel = Model<IUserTokenRef>;
