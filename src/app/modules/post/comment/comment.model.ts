import { model, Schema, Types } from 'mongoose';
import { CommentModel, IComment } from './comment.interface';
import { COMMENT_REACTION } from './comment.constant';

const commentSchema = new Schema<IComment, CommentModel>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String
    },
    image: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Comment = model<IComment, CommentModel>('Comment', commentSchema);