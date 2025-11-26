import { model, Schema } from 'mongoose';
import { FollowerModel, IFollower } from './follower.interface';

const followerSchema = new Schema<IFollower, FollowerModel>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

followerSchema.index({ follower: 1, following: 1 }, { unique: true });

export const Follower = model<IFollower, FollowerModel>(
  'Follower',
  followerSchema
);
