import { model, Schema } from 'mongoose';
import { CLUB_ROLE } from '../club.constant';
import { ClubMemberModel, IClubMember } from './club_members.interface';

const clubMemberSchema = new Schema<IClubMember, ClubMemberModel>(
  {
    club: {
      type: Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(CLUB_ROLE),
      default: CLUB_ROLE.USER,
    },
  },
  { timestamps: true }
);

clubMemberSchema.index({ club: 1, user: 1 }, { unique: true });

export const ClubMember = model<IClubMember>('ClubMember', clubMemberSchema);
