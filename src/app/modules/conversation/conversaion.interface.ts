import mongoose, { Model } from "mongoose";

export type IConversation = {
    creator: mongoose.Types.ObjectId;
    participant: mongoose.Types.ObjectId;
    lastMessage?: mongoose.Types.ObjectId;
}

export type IConversationModel = Model<IConversation, Record<string, unknown>>