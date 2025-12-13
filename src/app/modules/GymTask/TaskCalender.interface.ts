import { Types, Model } from "mongoose";

export interface ITaskCalendar {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  year: number;              // example: 2024
  month: number;             // 1 = Jan, 12 = Dec
  selectedStartDate: Date;   // "2025-12-08"
  selectedEndDate: Date;     // "2025-12-12"
  isCheckedToday: boolean;
  targetedWorkoutDates?: Date[]; // optional if needed
  selectedWorkoutDates: Date[]; // optional if needed
  workoutPictures:{ date: Date; image: string }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type ITaskCalendarModel = Model<ITaskCalendar>;
