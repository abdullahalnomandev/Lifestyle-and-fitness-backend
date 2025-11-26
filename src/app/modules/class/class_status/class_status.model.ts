import { model, Schema, Types } from 'mongoose';

export interface IClassStatus {
    is_visiable: boolean
    class_booking_ref_id: string;
    club: Types.ObjectId;
}

const classStatusSchema = new Schema<IClassStatus>(
    {
        is_visiable: {
            type: Boolean,
            default: true
        },
        class_booking_ref_id: {
            type: String,
            required: true
        },
        club: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Club'
        }
    },
    { timestamps: true }
);

export const ClassStatus = model<IClassStatus>('ClassStatus', classStatusSchema);
