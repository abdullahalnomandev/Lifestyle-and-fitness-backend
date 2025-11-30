import { Schema, model } from 'mongoose';
import { IUserToken, UserTokenModel } from './userToken.interface';

const UserTokenSchema = new Schema<IUserToken, UserTokenModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    numberOfToken: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const UserToken = model<IUserToken, UserTokenModel>(
  'UserToken',
  UserTokenSchema
);
