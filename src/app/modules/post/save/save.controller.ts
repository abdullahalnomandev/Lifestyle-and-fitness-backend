import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { SaveService } from './save.service';

const toggleSave = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const userId = req.user?.id;

    const hasSaved = await SaveService.hasUserSaved(postId, userId);

    let result;
    let message;

    if (hasSaved) {
      result = await SaveService.deleteSave(postId, userId);
      message = 'Post unsaved successfully';
    } else {
      result = await SaveService.createSave(postId, userId);
      message = 'Post saved successfully';
    }

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message,
      data: result,
    });
  }
);

const getPostSaves = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const query = req.query;
  const saves = await SaveService.getSavesByPost(postId, query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post saves retrieved successfully',
    pagination: saves.pagination,
    data: saves.data,
  });
});

const getUserSaveStatus = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const userId = req.user?.id;

  const hasSaved = await SaveService.hasUserSaved(postId, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User save status retrieved successfully',
    data: { hasSaved },
  });
});

export const SaveController = {
  toggleSave,
  getPostSaves,
  getUserSaveStatus,
};

