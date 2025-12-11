import { IUserToken } from './userToken.interface';
import { UserToken } from './userToken.model';

const createToken = async (id: string): Promise<IUserToken | null> => {
  const result = await UserToken.create({ user: id, numberOfToken: 5 });
  return result;
};

const getSingleToken = async (id: string): Promise<IUserToken> => {
  let result = await UserToken.findOne({ user: id });
  if (!result) {
    result = await UserToken.create({ user: id, numberOfToken: 0 });
  }
  return result;
};

export const UserTokenService = {
  createToken,
  getSingleToken,
};
