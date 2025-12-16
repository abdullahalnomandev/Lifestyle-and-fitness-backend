import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { mealFilterableFields } from './meal.constant';
import { IMeal } from './meal.interface';
import { MealService } from './meal.service';

const createMeal = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  let image = getSingleFilePath(req.files, 'image');
  const data: any = {
    ...req.body,
    creator: user?.id,
  };

  if (image) {
    data.image = image;
  }

  const result = await MealService.createMeal(data);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Meal created successfully!',
    data: result,
  });
});

const getAllMeals = catchAsync(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const filters = pick(req.query, mealFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await MealService.getAllMeals(
    filters,
    paginationOptions,
    categoryId,
    req.user?.id
  );

  sendResponse<IMeal[]>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Meals fetched successfully !',
    pagination: result.pagination,
    data: result.data,
  });
});

const getSingleMeal = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await MealService.getSingleMeal(id, req.user?.id,req?.user?.role);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Meal fetched successfully!',
    data: result,
  });
});

const updateMeal = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  let image = getSingleFilePath(req.files, 'image');
  const data: any = {
    ...req.body,
  };

  if (image) {
    data.image = image;
  }

  const result = await MealService.updateMeal(id, data);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Meal updated successfully!',
    data: result,
  });
});

const deleteMeal = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await MealService.deleteMeal(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Meal deleted successfully!',
    data: result,
  });
});

export const MealController = {
  createMeal,
  getAllMeals,
  getSingleMeal,
  updateMeal,
  deleteMeal,
};
