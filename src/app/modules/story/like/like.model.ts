import { model, Schema } from 'mongoose';
import { IStoryLike, StoryLikeModel } from './like.interface';

const storyLikeSchema = new Schema<IStoryLike, StoryLikeModel>(
  {
    story: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
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
storyLikeSchema.index({ story: 1, user: 1 }, { unique: true });

export const StoryLike = model<IStoryLike, StoryLikeModel>('StoryLike', storyLikeSchema);

