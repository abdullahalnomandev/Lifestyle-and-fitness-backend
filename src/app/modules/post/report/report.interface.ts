import mongoose, { Model, Types } from 'mongoose';
import { IUser } from '../../user/user.interface';
import { IPOST } from '../post.interface';

export interface IReport extends Document {
  post: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  reason: string;
  description?: string;
  status: "pending" | "reviewed" | "resolved";
  createdAt: Date;
}

export type ReportModel = Model<IReport>;
