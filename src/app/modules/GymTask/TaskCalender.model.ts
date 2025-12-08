import { model, Schema } from 'mongoose';
import { ITaskCalender, ITaskCalenderModel } from './TaskCalender.interface';

const taskCalenderSchema = new Schema<ITaskCalender, ITaskCalenderModel>(
  {
    year: {
      type: Number,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    seletectedWorkoutDates: {
      type: [Date],
      default: [],
    },
    workOutDates: {
      type: [Date],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const TaskCalender = model<ITaskCalender, ITaskCalenderModel>(
  'TaskCalender',
  taskCalenderSchema
);

