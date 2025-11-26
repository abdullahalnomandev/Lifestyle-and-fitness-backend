import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { getMultipleFilesPath, getSingleFilePath } from '../../../shared/getFilePath';
import { MesdsageService } from './message.service';

const sendMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sender = (req.user as any)?.id;

    let image = getMultipleFilesPath(req.files, 'image');
    const data = {
      sender,
      image,
      ...req.body,
    };

    const result = await MesdsageService.sendMessage(data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Message created successfully',
      data: result,
    });
  }
);

const getAllMessages = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

  const userId = req.user?.id;
  const conversationId = req.params?.id as string;
  const result = await MesdsageService.getAllMessages(req.query,userId, conversationId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'messages fetch successfully',
    data: result,
  });
}
);



export const MessageController = {
  sendMessage,
  getAllMessages
};