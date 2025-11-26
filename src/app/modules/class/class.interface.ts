import mongoose, { Model, Schema, Types } from 'mongoose';
import { CLASS_ROLE, CLASS_STATUS, DAY_OF_WEEK, MEMBERS_STATUS, PERIOD_OF_MONTH, REPEAT_TYPE, REPEAT_UNTIL } from './class.constant';

export type IClass = {
  _id?: Types.ObjectId;
  club:mongoose.ObjectId
  creator:mongoose.ObjectId;
  class_status:CLASS_STATUS,
  class_name:string;
  description: string;
  attendee_instructions: string;
  location: string;
  level_of_exprience:number;
  features_skills?: string[];
  date_of_class:Date; // 01/10/2000 or // 2025-11-05T18:15:00.000Z
  start_time:string; // 13:42
  duration:string;// 4:50
  //
  reoccurring_class:{
    repeat: REPEAT_TYPE; // repeat type ( "none" || "daily" || "weekly" || "monthly" || "yearly", )
    repeat_every: number; //repeat time
    repeat_until?: REPEAT_UNTIL; // ex: ( forever || until_date || after_occurrences )
    total_occurrences?: number // If select after_occurences
    repeat_untilDate?: Date // If select until_date // ISO date string: "YYYY-MM-DD"

    // SELECT WEEKLY
    repeat_days_of_week: (DAY_OF_WEEK)[]; //if select weekly    ("monday" || "tuesday" || "wednesday" || "thursday" || "friday" || "saturday" || "sunday")[];

    // MONTH AND YEAR
    day_of_month?:number // if select repeat monthly || yearly
    period_of_month?:PERIOD_OF_MONTH; //if select repeat monthly || yearly ("first","second","third","fourth","last") && if didn't select day_of_month
    period_of_day?:DAY_OF_WEEK; // //if select repeat monthly || yearly ("monday" || "tuesday" || "wednesday" || "thursday" || "friday" || "saturday" || "sunday" || "day"|| "weekend" || "weekday");  && if didn't select day_of_month
  },
  const_per_ticket:number; // additional 0.45 will be add to cover transaction fee
  max_number_of_attendees:number;
  class_mnamagers: [ Types.ObjectId];
  delete_class: boolean;
};

export type CommentModel = Model<IClass>;