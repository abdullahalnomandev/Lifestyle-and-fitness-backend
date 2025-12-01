import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { MealAndRecipeCategory } from '../mealAndRecipeCategory/mealAndRecipeCategory.model';
import { UserToken } from '../userToken';
import { UserTokenRef } from '../userTokenRef/userTokenRef.model';
import { mealSearchableFields } from './meal.constant';
import { IMeal } from './meal.interface';
import { Meal } from './meal.model';

const createMeal = async (payload: IMeal): Promise<IMeal | null> => {
  const isCategoryExist = await MealAndRecipeCategory.findById(
    payload.mealCategory
  );

  if (!isCategoryExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Meal category does not exist');
  }

  const result = await Meal.create(payload);
  return result;
};

const getAllMeals = async (
  filters: any,
  query: Record<string, unknown>,
  categoryId: string,
  userId: string
) => {
  const mealQuery = new QueryBuilder(
    Meal.find({ mealCategory: categoryId }),
    query
  )
    .search(mealSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await mealQuery.modelQuery.lean();
  const pagination = await mealQuery.getPaginationInfo();

  // Get all item IDs for batch lookup
  const itemIds = result.map(item => item._id);

  const existingRefs = await UserTokenRef.find({
    user: userId,
    ref: { $in: itemIds },
  })
    .select('ref')
    .lean();

  const existingRefIds = new Set(existingRefs.map(ref => ref.ref.toString()));

  // Process data without async operations in map
  const filteredData = result.map(item => ({
    ...item,
    looked: !existingRefIds.has(item._id.toString()),
  }));

  return {
    data: filteredData,
    pagination,
  };
};

const getSingleMeal = async (
  id: string,
  userId: string
): Promise<IMeal | null> => {
  const [doc, existingRef, totalToken] = await Promise.all([
    Meal.findById(id),
    UserTokenRef.exists({ ref: id, user: userId }).lean(),
    UserToken.findOne({ user: userId }),
  ]);

  if (!doc) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Meal not found');
  }
  if ((totalToken?.numberOfToken ?? 0) < 1 && !existingRef) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'You have no token to unlock.');
  }

  if (!existingRef && totalToken && totalToken?.numberOfToken >= 1) {
    await Promise.all([
      UserTokenRef.create({ ref: id, user: userId }),
      UserToken.updateOne({ user: userId }, { $inc: { numberOfToken: -1 } }),
    ]);
  }

  return doc;
};

const updateMeal = async (
  id: string,
  payload: Partial<IMeal>
): Promise<IMeal | null> => {
  const result = await Meal.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Meal not found');
  }
  return result;
};

const deleteMeal = async (id: string): Promise<IMeal | null> => {
  const result = await Meal.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Meal not found');
  }
  return result;
};

export const MealService = {
  createMeal,
  getAllMeals,
  getSingleMeal,
  updateMeal,
  deleteMeal,
};
