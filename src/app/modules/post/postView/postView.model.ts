import { model, Schema } from 'mongoose';
import { IPostView, PostViewModel } from './postView.interface';

const postViewSchema = new Schema<IPostView, PostViewModel>(
  {
    video: {
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

postViewSchema.index({ video: 1, user: 1 }, { unique: true });

export const PostView = model<IPostView, PostViewModel>('PostView', postViewSchema);