import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import { PROFILE_MODE, USER_AUTH_PROVIDER } from './user.constant';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email?: string;
  mobile?: string;
  confirm_password?: string;
  password: string;
  role: USER_ROLES;
  status: 'active' | 'delete';
  verified: boolean;
  profile_mode: PROFILE_MODE;
  image: string;
  token?: string;
  authorization?: {
    oneTimeCode: string;
    expireAt: Date;
  };
  google_id_token?: string;
  auth_provider: USER_AUTH_PROVIDER;

  // Added missing fields based on the image
  location?: string;
  occupation?: string;
  dreamJob?: string;
  education?: string;
  about?: string;
  preferences?: string[];
}

export interface UserModel extends Model<IUser> {
  isExistUserById(id: string): Promise<IUser | null>;
  isExistUserByEmail(email: string): Promise<IUser | null>;
  isMatchPassword(password: string, hashPassword: string): Promise<boolean>;
}
