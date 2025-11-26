import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { NotificationService } from './notification.service';

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await NotificationService.getMyNotifications(userId, req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notifications retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const markAsSeen = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  const result = await NotificationService.markAsSeen(userId, id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notification marked as seen',
    data: result,
  });
});

export const NotificationController = {
  getMyNotifications,
  markAsSeen,
};
