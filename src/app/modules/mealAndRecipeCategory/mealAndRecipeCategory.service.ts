import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { Meal } from '../meal/meal.model';
import { mealAndRecipeCategorySearchableFields } from './mealAndRecipeCategory.constant';
import { IMealAndRecipeCategory } from './mealAndRecipeCategory.interface';
import { MealAndRecipeCategory } from './mealAndRecipeCategory.model';

const createMealAndRecipeCategory = async (
  payload: IMealAndRecipeCategory
): Promise<IMealAndRecipeCategory | null> => {
  const result = await MealAndRecipeCategory.create(payload);
  return result;
};

const getAllMealAndRecipeCategory = async (
  filters: any,
  query: Record<string, unknown>
) => {
  let queryField = query;
  queryField = { ...query, active: true };
  const mealAndRecipeCategoryQuery = new QueryBuilder(
    MealAndRecipeCategory.find(),
    queryField
  )
    .search(mealAndRecipeCategorySearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await mealAndRecipeCategoryQuery.modelQuery;
  const pagination = await mealAndRecipeCategoryQuery.getPaginationInfo();

  // Get meal count for each category
  const categoriesWithMealCount = await Promise.all(
    result.map(async item => {
      const mealCount = await Meal.countDocuments({
        //@ts-ignore
        mealCategory: item?._id,
      });
      return {
        //@ts-ignore
        ...item.toObject(),
        mealCount,
      };
    })
  );

  return {
    data: categoriesWithMealCount,
    pagination,
  };
};

const getSingleMealAndRecipeCategory = async (
  id: string
): Promise<IMealAndRecipeCategory | null> => {
  const result = await MealAndRecipeCategory.findById(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'MealAndRecipeCategory not found'
    );
  }
  return result;
};

const updateMealAndRecipeCategory = async (
  id: string,
  payload: Partial<IMealAndRecipeCategory>
): Promise<IMealAndRecipeCategory | null> => {
  const result = await MealAndRecipeCategory.findOneAndUpdate(
    { _id: id },
    payload,
    {
      new: true,
    }
  );
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'MealAndRecipeCategory not found'
    );
  }
  return result;
};

const deleteMealAndRecipeCategory = async (
  id: string
): Promise<IMealAndRecipeCategory | null> => {
  const result = await MealAndRecipeCategory.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'MealAndRecipeCategory not found'
    );
  }
  return result;
};

export const MealAndRecipeCategoryService = {
  createMealAndRecipeCategory,
  getAllMealAndRecipeCategory,
  getSingleMealAndRecipeCategory,
  updateMealAndRecipeCategory,
  deleteMealAndRecipeCategory,
};
