import { model, Schema } from 'mongoose';
import { ITaskCalendar, ITaskCalendarModel } from './TaskCalender.interface';

const taskCalendarSchema = new Schema<ITaskCalendar, ITaskCalendarModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    selectedStartDate: {
      type: Date,
      required: true,
    },
    selectedEndDate: {
      type: Date,
      required: true,
    },
    selectedWorkoutDates: {
      type: [Date],
      default: [],
    },
    targetedWorkoutDates: {
      type: [Date],
      default: [],
    },
    workoutPictures: {
      type: [{ date: Date, image: String ,caption: String}],
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

export const TaskCalendar = model<ITaskCalendar, ITaskCalendarModel>(
  'TaskCalendar',
  taskCalendarSchema
);
