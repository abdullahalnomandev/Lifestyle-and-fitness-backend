import mongoose, { model, Schema } from 'mongoose';
import { IReport, ReportModel } from './report.interface';
import { REPORT_STATUS } from './report.constant';

const ReportSchema = new Schema<IReport>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [REPORT_STATUS.PENDING, REPORT_STATUS.REVIEWED, REPORT_STATUS.RESOLVED],
      default: REPORT_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  }
);
export const Report = model<IReport, ReportModel>('Report', ReportSchema);

