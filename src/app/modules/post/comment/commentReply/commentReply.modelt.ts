import { model, Schema, Types } from 'mongoose';
import { CommentReplyModel, ICommentReply } from './commentReply.interface';
import { CommentModel } from '../comment.interface';

const commentReplySchema = new Schema<ICommentReply, CommentReplyModel>(
  {
    comment: {
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

export const CommentReply = model<ICommentReply, CommentModel>('CommentReply', commentReplySchema);