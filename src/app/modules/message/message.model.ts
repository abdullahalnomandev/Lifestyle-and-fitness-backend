import { model, Schema } from 'mongoose';
import { IMessage, IMessageModel } from './message.interface';

const messageSchema = new Schema<IMessage, IMessageModel>(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiver: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        conversation: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
        },
        text: {
            type: String,
        },
        image: {
            type: [String],
        }
    },
    { timestamps: true }
);

export const Message = model<IMessage, IMessageModel>('Message', messageSchema);