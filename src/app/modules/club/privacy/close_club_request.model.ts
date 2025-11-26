import { model, Schema } from 'mongoose';
import { ICloseClubRequest, CloseClubRequestModel, CLOSING_STATUS } from './close_club_request.interface';

const closeClubRequestSchema = new Schema<ICloseClubRequest, CloseClubRequestModel>(
  {
    marketing_permission: {
      type: Boolean,
      required: true,
    },
    feedback: {
      type: String,
      required: true,
      trim: true,
    },
    closing_status: {
      type: String,
      required: true,
      default: CLOSING_STATUS.PENDING,
    },
    club: {
      type: Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    requested_user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const CloseClubRequest = model<ICloseClubRequest>('CloseClubRequest', closeClubRequestSchema);
