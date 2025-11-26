import { Model, Types } from 'mongoose';
import { IComment } from '../comment.interface';
import { IUser } from '../../../user/user.interface';


export type ICommentLike = {
  comment: Types.ObjectId | IComment;
  user: Types.ObjectId | IUser;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CommentLikeModel = Model<ICommentLike>;
