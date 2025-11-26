import { model, Schema, Types } from 'mongoose';
import { CommentModel } from '../comment.interface';
import { CommentLikeModel, ICommentLike } from './commentLike.interface';

const commentLikeSchema = new Schema<ICommentLike, CommentLikeModel>(
  {
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  { timestamps: true }
);

export const CommentLike = model<ICommentLike, CommentLikeModel>('CommentLike', commentLikeSchema);