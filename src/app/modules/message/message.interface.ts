import mongoose, { Model } from "mongoose";

export type IMessage = {
    sender: mongoose.Types.ObjectId;
    receiver: mongoose.Types.ObjectId;
    conversation: mongoose.Types.ObjectId;
    text?: string;
    image?: string[];
}

export type IMessageModel = Model<IMessage, Record<string, unknown>>