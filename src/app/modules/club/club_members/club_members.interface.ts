import { Model, Types } from 'mongoose';
import { IUser } from '../../user/user.interface';
import { IClub } from '../club.interface';
import { CLUB_ROLE } from './club_members.constant';

export type IClubMember = {
  _id?: Types.ObjectId;
  club: Types.ObjectId | IClub;
  user: Types.ObjectId | IUser;
  role: CLUB_ROLE;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ClubMemberModel = Model<IClubMember>;
