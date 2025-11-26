import mongoose, { Model, Schema, Types } from 'mongoose';
import { MEMBERS_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from './booking.constant';
import { BookingClassModel, IBookingClass } from './bookingClass.interface';


const bookingClassSchema = new Schema<IBookingClass>(
    {
        coupon_code: { type: String },
        club: { type: Schema.Types.ObjectId, ref: 'Club', required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
        class_booking_ref_id: { type: String, required: true },
        booking_id: { type: String, required: true },
        price_of_class: { type: Number, required: true },
        payment_status: { type: String, enum: Object.values(PAYMENT_STATUS)},
        payment_method: { type: String, enum: Object.values(PAYMENT_METHOD) },
        attandence_status: { type: String, enum: Object.values(MEMBERS_STATUS), default: MEMBERS_STATUS.INITIAL, required: true },
        discount: { type: Number, default: 0 },
        isQueued: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// bookingClassSchema.index({ user: 1, club: 1, class_booking_ref_id:1 }, { unique: true });

export const BookingClass = mongoose.model<IBookingClass, BookingClassModel>('BookingClass', bookingClassSchema);
