import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { Favourite } from './favourite.model';

const createFavourite = async (handle: string, userId: string) => {

 console.log({handle})
  const favourite = await Favourite.create({ handle, user: userId });
  return favourite;
};

const deleteFavourite = async (mealId: string, userId: string) => {
  const favourite = await Favourite.findOneAndDelete(
    { handle: mealId, user: userId },
    { new: true }
  );

  if (!favourite) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Favourite not found');
  }

  return favourite;
};

const getUserFavourites = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const favouriteQuery = new QueryBuilder(
    Favourite.find({ user: userId }).populate('meal'),query)
    .paginate()
    .fields()
    .filter()
    .sort();

  const data = await favouriteQuery.modelQuery;
  const pagination = await favouriteQuery.getPaginationInfo();

  return { data, pagination };
};

const hasUserFavourited = async (handle: string, userId: string) => {
  return Favourite.exists({ handle, user: userId }).lean();
};

export const FavouriteService = {
  createFavourite,
  deleteFavourite,
  getUserFavourites,
  hasUserFavourited,
};

