import { Request, Response } from 'express';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { mealAndRecipeCategoryFilterableFields } from './mealAndRecipeCategory.constant';
import { IMealAndRecipeCategory } from './mealAndRecipeCategory.interface';
import { MealAndRecipeCategoryService } from './mealAndRecipeCategory.service';
import { StatusCodes } from 'http-status-codes';

const createMealAndRecipeCategory = catchAsync( async (req: Request, res: Response) => {
    const { ...mealAndRecipeCategoryData } = req.body;
    const result = await MealAndRecipeCategoryService.createMealAndRecipeCategory(
        mealAndRecipeCategoryData
      );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'MealAndRecipeCategory created successfully!',
      data: result,
    });
  }
);

const getAllMealAndRecipeCategory = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, mealAndRecipeCategoryFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result =
      await MealAndRecipeCategoryService.getAllMealAndRecipeCategory(
        filters,
        paginationOptions,
        req?.user?.role
      );

    sendResponse<IMealAndRecipeCategory[]>(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'MealAndRecipeCategory fetched successfully !',
      pagination: result.pagination,
      data: result.data,
    });
  }
);

const getSingleMealAndRecipeCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await MealAndRecipeCategoryService.getSingleMealAndRecipeCategory(id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'MealAndRecipeCategory fetched successfully!',
      data: result,
    });
  }
);

const updateMealAndRecipeCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updatedData = req.body;
    const result =
      await MealAndRecipeCategoryService.updateMealAndRecipeCategory(
        id,
        updatedData
      );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'MealAndRecipeCategory updated successfully!',
      data: result,
    });
  }
);

const deleteMealAndRecipeCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await MealAndRecipeCategoryService.deleteMealAndRecipeCategory(id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'MealAndRecipeCategory deleted successfully!',
      data: result,
    });
  }
);

export const MealAndRecipeCategoryController = {
  createMealAndRecipeCategory,
  getAllMealAndRecipeCategory,
  getSingleMealAndRecipeCategory,
  updateMealAndRecipeCategory,
  deleteMealAndRecipeCategory,
};
