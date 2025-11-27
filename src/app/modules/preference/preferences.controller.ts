import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PreferencesService } from './preferences.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await PreferencesService.createToDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Interest created successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await PreferencesService.updateInDB(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Interest updated successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await PreferencesService.deleteFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Interest deleted successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await PreferencesService.getAllFromDB(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Interest retrieved successfully',
    pagination:result.pagination,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await PreferencesService.getByIdFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Interest retrieved successfully',
    data: result,
  });
});

export const PreferenceController = { create, update, remove, getAll, getById };

