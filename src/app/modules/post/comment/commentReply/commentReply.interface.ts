import { Model, Types } from 'mongoose';
import { IComment } from '../comment.interface';
import { IUser } from '../../../user/user.interface';


export type ICommentReply = {
  comment: Types.ObjectId | IComment;
  creator: Types.ObjectId | IUser;
  text?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CommentReplyModel = Model<ICommentReply>;
