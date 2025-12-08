import { Model, Types } from 'mongoose';

export interface ITaskCalender {
  _id?: Types.ObjectId;
  user:Types.ObjectId;
  year: number;
  month: number;
  isCheckedToday:boolean;
  seletectedWorkoutDates: Date[];
  workOutDates: Date[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type ITaskCalenderModel = Model<ITaskCalender, Record<string, unknown>>;

