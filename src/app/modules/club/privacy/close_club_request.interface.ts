import { Model, Schema } from 'mongoose';

export enum CLOSING_STATUS {
  PENDING = 'pending',
  CLOSED = 'closed',
}

export type ICloseClubRequest = {
    _id: Schema.Types.ObjectId;
    marketing_permission: boolean; // if true will be delete form everywhere
    feedback: string;
    club: Schema.Types.ObjectId;
    closing_status: CLOSING_STATUS;
    requested_user: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;

};
export type CloseClubRequestModel = Model<ICloseClubRequest, Record<string, unknown>>;
