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
  query: Record<string, unknown>,
  role: string
) => {
  let queryField = { ...query };

  // Only filter by active: true if role is not admin or superadmin
  const isAdmin = role === 'admin' || role === 'super_admin';
  if (!isAdmin) {
    queryField = { ...queryField, active: true };
  }

  // Ensure searchTerm from filters (query params/body) makes it to QueryBuilder
  let searchTerm =
    (filters && typeof filters === 'object' && filters.searchTerm)
      ? filters.searchTerm
      : (query && typeof query === 'object' && query.searchTerm)
        ? query.searchTerm
        : undefined;

  // Always set searchTerm (if provided) so QueryBuilder sees it
  if (searchTerm !== undefined && searchTerm !== null && searchTerm !== '') {
    queryField = { ...queryField, searchTerm };
  } else {
    // Remove previous searchTerm if any
    if ('searchTerm' in queryField) {
      const { searchTerm, ...rest } = queryField;
      queryField = rest;
    }
  }

  // Use QueryBuilder
  const qb = new QueryBuilder(MealAndRecipeCategory.find(), queryField)
    .search(mealAndRecipeCategorySearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await qb.modelQuery.lean();
  const pagination = await qb.getPaginationInfo();

  // Attach mealCount for each category
  const categoriesWithMealCount = await Promise.all(
    result.map(async (item: any) => {
      const mealCount = await Meal.countDocuments({
        mealCategory: item?._id,
      });
      return { ...item, mealCount };
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
