import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { TaskCalenderService } from './TaskCalender.service';
import { getMultipleFilesPath, getSingleFilePath } from '../../../shared/getFilePath';

const createTaskCalender = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;

  const result = await TaskCalenderService.createTaskCalendar(data, req?.user?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Task calendar created successfully',
    data: result,
  });
});

const getAllTaskCalenders = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, any>;
  const { data } = await TaskCalenderService.getAllTaskCalenders(
    query
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Task calendars retrieved successfully',
    data,
  });
});


const uploadWorkoutPicture = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  let image = getSingleFilePath(req.files, 'image');
  let caption = req.body.caption;

  const result = await TaskCalenderService.uploadWorkoutPicture(user, image as any, caption);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Workout picture uploaded successfully',
    data: result,
  });
});


const getWorkoutProgress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const result = await TaskCalenderService.getWorkoutProgress(userId as string,req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Workout progress retrieved successfully',
    data: result,
  });
});





export const TaskCalenderController = {
  createTaskCalender,
  getAllTaskCalenders,
  uploadWorkoutPicture,
  getWorkoutProgress
};

