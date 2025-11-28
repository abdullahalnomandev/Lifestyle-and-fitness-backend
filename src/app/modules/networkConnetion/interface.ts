import { Model, Types } from 'mongoose';

export type INetworkConnection = {
  requestBy?: Types.ObjectId;
  acceptBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

export type INetworkConnectionModel = Model<INetworkConnection>;
