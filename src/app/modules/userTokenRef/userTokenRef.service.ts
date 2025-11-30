import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { IUserTokenRef } from './userTokenRef.interface';
import { UserTokenRef } from './userTokenRef.model';

const createUserTokenRef = async (
  payload: IUserTokenRef
): Promise<IUserTokenRef | null> => {
  const isRefExist = await UserTokenRef.findOne({ ref: payload.ref });

  if (payload.user) {
    const isUserExist = await User.findById(payload.user);
    if (!isUserExist) {
      throw new ApiError(404, 'User not found');
    }
  }

  const result = await UserTokenRef.create(payload);
  return result ?? isRefExist;
};

const getSingleUserTokenRef = async (
  ref: string
): Promise<IUserTokenRef | null> => {
  const result = await UserTokenRef.findOne({ ref }).populate('user');
  return result;
};

const updateUserTokenRef = async (
  ref: string,
  payload: Partial<IUserTokenRef>
): Promise<IUserTokenRef | null> => {
  const result = await UserTokenRef.findOneAndUpdate({ ref }, payload, {
    new: true,
  }).populate('user');
  return result;
};

const deleteUserTokenRef = async (
  ref: string
): Promise<IUserTokenRef | null> => {
  const result = await UserTokenRef.findOneAndDelete({ ref });
  return result;
};

export const UserTokenRefService = {
  createUserTokenRef,
  getSingleUserTokenRef,
  updateUserTokenRef,
  deleteUserTokenRef,
};
