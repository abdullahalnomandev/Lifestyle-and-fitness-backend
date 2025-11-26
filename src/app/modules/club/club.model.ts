import { model, Schema } from 'mongoose';
import { CLUB_PERIOD_TYPE } from './club.constant';
import { ClubModel, IClub } from './club.interface';

const clubSchema = new Schema<IClub, ClubModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    club_creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stablished_date: {
      type: Date,
    },
    country: {
      type: String,
    },
    post_code: {
      type: String,
    },
    club_specilaity: {
      type: [String],
      default: [],
      trim: true,
    },
    image: {
      type: String,
    },
    cover_image: {
      type: String,
    },
    allow_waiting_list: {
      type: Boolean,
      default: true,
    },
    allow_class_cancelation: {
      type: Boolean,
      default: true,
    },
    pre_class_cancelation: {
      period: {
        type: Number,
        default: 0,
      },
      period_type: {
        type: String,
        default: CLUB_PERIOD_TYPE.MINUTE,
      },
    },
    premium_feature: {
      community_and_sharing: {
        type: Boolean,
        default: true,
      },
      booking_system: {
        type: Boolean,
        default: true,
      },
    },
    payment: {
      currency_of_payment: {
        type: String,
        default: 'usd',
      },
      in_person_payment: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

export const Club = model<IClub>('Club', clubSchema);
