import { model, Schema } from 'mongoose';
import { INetworkConnection, INetworkConnectionModel } from './interface';
import { NETWORK_CONNECTION_STATUS } from './networkConnetion.constant';

const networkConnectionSchema = new Schema<
  INetworkConnection,
  INetworkConnectionModel
>(
  {
    requestFrom: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(NETWORK_CONNECTION_STATUS),
      default: NETWORK_CONNECTION_STATUS.PENDING,
    },
  },
  { timestamps: true }
);

networkConnectionSchema.index({ requestFrom: 1, requestTo: 1 }, { unique: true });

export const NetworkConnection = model<INetworkConnection, INetworkConnectionModel>(
  'NetworkConnection',
  networkConnectionSchema
);
