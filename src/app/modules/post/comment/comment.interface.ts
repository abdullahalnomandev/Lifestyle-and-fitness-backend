import { Model, Types } from 'mongoose';
import { IUser } from '../../user/user.interface';
import { IPOST } from '../post.interface';
import { COMMENT_REACTION } from './comment.constant';

export type IComment = {
  post: Types.ObjectId | IPOST;
  creator: Types.ObjectId | IUser;
  text?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CommentModel = Model<IComment>;
