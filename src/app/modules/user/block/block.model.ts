import { model, Schema } from 'mongoose';
import { IUserBlock, UserBlockModel } from './block.interface';

const UserBlockSchema = new Schema<IUserBlock>(
  {
    blocker: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blocked: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

UserBlockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

export const UserBlock = model<IUserBlock, UserBlockModel>('UserBlock', UserBlockSchema);

