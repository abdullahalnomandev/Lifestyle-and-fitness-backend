import { model, Schema } from 'mongoose';
import { ICalendar, ICalendarModel } from './calender.interface';

const calendarSchema = new Schema<ICalendar, ICalendarModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Index for better performance
calendarSchema.index({ user: 1, status: 1 });

export const Calendar = model<ICalendar, ICalendarModel>(
  'Calendar',
  calendarSchema
);
