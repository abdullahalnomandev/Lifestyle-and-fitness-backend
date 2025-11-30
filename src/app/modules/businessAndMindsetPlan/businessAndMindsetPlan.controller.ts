import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { BusinessAndMindsetPlanService } from './businessAndMindsetPlan.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await BusinessAndMindsetPlanService.createToDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Business and Mindset Plan created successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await BusinessAndMindsetPlanService.updateInDB(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Business and Mindset Plan updated successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await BusinessAndMindsetPlanService.deleteFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Business and Mindset Plan deleted successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await BusinessAndMindsetPlanService.getAllFromDB(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Business and Mindset Plans retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await BusinessAndMindsetPlanService.getByIdFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Business and Mindset Plan retrieved successfully',
    data: result,
  });
});

export const BusinessAndMindsetPlanController = {
  create,
  update,
  remove,
  getAll,
  getById,
};

