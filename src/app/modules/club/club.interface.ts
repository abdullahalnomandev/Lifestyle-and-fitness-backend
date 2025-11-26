import { Model, Schema } from 'mongoose';
import { CLUB_PERIOD_TYPE } from './club.constant';

export type IClub = {
  name: string;
  description?: string;
  website?: string;
  address?: string;
  club_creator: Schema.Types.ObjectId;
  stablished_date: Date;
  country: string;
  post_code: string;
  club_specilaity: [string];
  image: string;
  cover_image: string;
  // Club Settings
  allow_waiting_list: boolean; // default: true
  allow_class_cancelation: boolean; // default: true
  pre_class_cancelation?: {
    period: number;
    period_type: CLUB_PERIOD_TYPE; // minute, hour, day
  };
  premium_feature: {
    community_and_sharing: boolean; // default: true
    booking_system: boolean; // default: true
  };
  payment: {
    currency_of_payment: string;
    in_person_payment: boolean;
  };
};
export type ClubModel = Model<IClub, Record<string, unknown>>;
