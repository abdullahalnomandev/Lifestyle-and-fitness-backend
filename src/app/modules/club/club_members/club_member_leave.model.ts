import { model, Schema } from 'mongoose';
import { ClubMemberModel } from './club_members.interface';

export interface IClubMemberLeave {
    club: Schema.Types.ObjectId;
    user: Schema.Types.ObjectId;
    feedback: string;
}
const MemberLeaveFeedbackSchema = new Schema<IClubMemberLeave, ClubMemberModel>(
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
        feedback: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

MemberLeaveFeedbackSchema.index({ club: 1, user: 1 }, { unique: true });

export const ClubMemberLeave = model<IClubMemberLeave>('ClubMemberLeave', MemberLeaveFeedbackSchema);
