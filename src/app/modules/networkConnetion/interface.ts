import { Model, Types } from 'mongoose';
import { NetworkConnectionStatus } from './networkConnetion.constant';

export type INetworkConnection = {
  requestFrom: Types.ObjectId;
  requestTo: Types.ObjectId;
  status?: NetworkConnectionStatus;
  createdAt?: Date;
  updatedAt?: Date;
};

export type INetworkConnectionModel = Model<INetworkConnection>;