import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { Favourite } from './favourite.model';
import { getAllFavoriteProducts } from '../shopify-gql-api/gql-api';

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
    Favourite.find({ user: userId }), query)
    .paginate()
    .fields()
    .filter()
    .sort();

  const data = await favouriteQuery.modelQuery;
  const pagination = await favouriteQuery.getPaginationInfo();

  // Collect all handles from the data array, filter out undefined/null
  // Convert each handle to gid format: "gid://shopify/Product/${handle}"
  const ids = Array.isArray(data)
    ? data.map((item: any) => item.handle)
        .filter(Boolean)
        .map((id: string) => `gid://shopify/Product/${id}`)
    : [];

  const favouriteProductsData = await getAllFavoriteProducts(ids);

  // Map product data, extract first variant price as productPrice
  const flatProducts = (favouriteProductsData?.nodes || []).map((product: any) => {
    const firstVariant = product.variants?.nodes?.[0];
    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      featuredImage: product.featuredImage?.originalSrc || null,
      productPrice: firstVariant?.price ?? null,
    };
  });

  return { data: flatProducts, pagination };
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

