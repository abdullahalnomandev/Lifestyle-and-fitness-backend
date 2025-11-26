import { Model, model, Schema, Types } from 'mongoose';

export interface IUserCredit {
  user: Types.ObjectId;
  club: Types.ObjectId;
  credit: number;
}

export type UserCreditModel = Model<IUserCredit>;
const userCreditSchema = new Schema<IUserCredit, UserCreditModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    club: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    credit: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

userCreditSchema.index({ user: 1, clubId: 1 }, { unique: true });

export const UserCredit = model<IUserCredit, UserCreditModel>('UserCredit', userCreditSchema);
