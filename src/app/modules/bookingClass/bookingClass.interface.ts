import mongoose, { Model, Schema, Types } from 'mongoose';
import { MEMBERS_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from './booking.constant';
export type IBookingClass = {
    coupon_code?: string;
    booking_id: string;
    club: mongoose.ObjectId
    user: mongoose.ObjectId;
    class: mongoose.ObjectId;
    class_booking_ref_id: string,
    price_of_class: number;
    payment_status: PAYMENT_STATUS;
    payment_method: PAYMENT_METHOD;
    attandence_status: MEMBERS_STATUS;
    isQueued?: boolean;
    discount?: number;
    createdAt?: Date;
    updatedAt?: Date;
};

export type BookingClassModel = Model<IBookingClass>;
