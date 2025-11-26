import { model, Schema } from 'mongoose';
import { ILike, LikeModel } from './like.interface';

const likeSchema = new Schema<ILike, LikeModel>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Create compound index to prevent duplicate likes
likeSchema.index({ post: 1, user: 1 }, { unique: true });

export const Like = model<ILike, LikeModel>('Like', likeSchema);