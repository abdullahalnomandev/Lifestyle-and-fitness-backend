import { model, Schema, Types } from 'mongoose';
import { IClass } from './class.interface';
import { CLASS_ROLE, CLASS_STATUS, DAY_OF_WEEK, PERIOD_OF_MONTH, REPEAT_TYPE, REPEAT_UNTIL } from './class.constant';

const classSchema = new Schema<IClass>(
    {
        club: {
            type: Schema.Types.ObjectId,
            ref: 'Club',
            required: true,
        },
        creator: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        class_status: {
            type: String,
            enum: Object.values(CLASS_STATUS),
            default: CLASS_STATUS.AVAILABLE,
        },
        class_name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        attendee_instructions: {
            type: String,
            required: true,
            trim: true,
        },
        location: {
            type: String,
            required: true,
            trim: true,
        },
        level_of_exprience: {
            type: Number,
            required: true,
        },
        features_skills: {
            type: [String],
            default: [],
        },
        date_of_class: {
            type: Date,
            required: true,
        },
        start_time: {
            type: String,
            required: true,
        },
        duration: {
            type: String,
            required: true,
        },
        reoccurring_class: {
            repeat: {
                type: String,
                enum: [REPEAT_TYPE],
                required: true,
            },
            repeat_every: {
                type: Number
            },
            repeat_days_of_week: {
                type: [String],
                enum: [DAY_OF_WEEK]
            },
            day_of_month: {
                type: Number,
            },
            repeat_until: {
                type: String,
                enum: [REPEAT_UNTIL],
            },
            total_occurrences: {
                type: Number,
            },
            repeat_untilDate: {
                type: Date,
            },
            period_of_month: {
                type: String,
                enum: Object.values(PERIOD_OF_MONTH),
            },
            period_of_day: {
                type: String,
                enum: Object.values(DAY_OF_WEEK),
            },
        },
        const_per_ticket: {
            type: Number,
            required: true,
        },
        max_number_of_attendees: {
            type: Number,
            required: true,
        },
        class_mnamagers: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        delete_class: {
            type: Boolean,
            default: false,
            select:0
        }
    },
    { timestamps: true }
);

export const Class = model<IClass>('Class', classSchema);
