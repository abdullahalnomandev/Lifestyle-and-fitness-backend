import { Types, Model } from 'mongoose';

export interface ICalendar {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  title: string;
  note?: string;
  date: Date;
  status: 'pending' | 'completed';
  createdAt?: Date;
  updatedAt?: Date;
}

export type ICalendarModel = Model<ICalendar>;
