import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { StoryService } from './story.service';

const createStory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const image = getSingleFilePath(req.files, 'image');
  const media = getSingleFilePath(req.files, 'media');

  const data: any = {
    ...req.body,
    creator: userId,
  };

  if (image) data.image = image;
  if (media) data.media = media;

  const result = await StoryService.createStory(data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Story created successfully',
    data: result,
  });
});

const getAllStories = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, any>;
  const userId = req.user?.id;
  const { data, pagination } = await StoryService.getAllStories(query, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Stories retrieved successfully',
    pagination,
    data,
  });
});

const getSingleStory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await StoryService.findById(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Story retrieved successfully',
    data: result,
  });
});

const updateStory = catchAsync(async (req: Request, res: Response) => {
  const image = getSingleFilePath(req.files, 'image');
  const media = getSingleFilePath(req.files, 'media');

  const payload: any = {
    ...req.body,
  };

  if (image) payload.image = image;
  if (media) payload.media = media;

  const result = await StoryService.updateStory(req.params.id, payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Story updated successfully',
    data: result,
  });
});

const deleteStory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await StoryService.deleteStory(userId, req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Story deleted successfully',
    data: result,
  });
});

const getAllUserStory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await StoryService.getAllUserStory(
    req.query,
    req.params.id,
    userId
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Story retrieved successfully',
    data: result,
  });
});

const watchSory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await StoryService.watchStory(
    req.params.id,
    userId
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Story watched successfully',
    data: result,
  });
});



export const StoryController = {
  createStory,
  getAllStories,
  getSingleStory,
  updateStory,
  deleteStory,
  getAllUserStory,
  watchSory
};
