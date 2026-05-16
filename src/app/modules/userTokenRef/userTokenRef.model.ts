import { Schema, model } from 'mongoose';
import { IUserTokenRef, IUserTokenRefModel } from './userTokenRef.interface';

const UserTokenRefSchema = new Schema<IUserTokenRef, IUserTokenRefModel>(
  {
    ref: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

UserTokenRefSchema.index({ ref: 1, user: 1 }, { unique: true });

export const UserTokenRef = model<IUserTokenRef, IUserTokenRefModel>(
  'UserTokenRef',
  UserTokenRefSchema
);