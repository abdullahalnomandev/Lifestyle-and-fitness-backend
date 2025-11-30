import { Schema, model } from 'mongoose';
import { IUserTokenRef, IUserTokenRefModel } from './userTokenRef.interface';

const UserTokenRefSchema = new Schema<IUserTokenRef, IUserTokenRefModel>(
  {
    ref: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false, // User is optional as per the interface
    },
  },
  {
    timestamps: true,
  }
);
UserTokenRefSchema.index({ ref: 1, user: 1 });

export const UserTokenRef = model<IUserTokenRef, IUserTokenRefModel>(
  'UserTokenRef',
  UserTokenRefSchema
);
