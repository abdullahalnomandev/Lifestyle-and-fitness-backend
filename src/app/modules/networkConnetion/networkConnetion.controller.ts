import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { NetworkConnectionService } from './networkConnetion.service';

const sendRequest = catchAsync(async (req: Request, res: Response) => {
  const data = {
    ...req.body,
    requestFrom: req.user?.id,
  };

  const result = await NetworkConnectionService.sendRequestToDB(data);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Connection request sent successfully',
    data: result,
  });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await NetworkConnectionService.updateStatusInDB(
    req.params.id,
    req.user?.id,
    req?.body?.status
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Connection updated successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await NetworkConnectionService.deleteFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Connection removed successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const userId = req?.user?.id;
  const result = await NetworkConnectionService.getAllFromDB(req.query, userId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Connections retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await NetworkConnectionService.getByIdFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Connection retrieved successfully',
    data: result,
  });
});

const cancelRequest = catchAsync(async (req: Request, res: Response) => {
  const data = {
    ...req.body,
    requestFrom: req.user?.id,
  };

  const result = await NetworkConnectionService.cancel(data);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Connection retrieved successfully',
    data: result,
  });
});

const disconnect = catchAsync(async (req: Request, res: Response) => {
  const result = await NetworkConnectionService.disconnect(
    req.params.id,
    req.user?.id
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Connection disconnected',
    data: result,
  });
});

const getUserAllNetworks = catchAsync(async (req: Request, res: Response) => {
  const result = await NetworkConnectionService.getUserAllNetworks(
    req.params.userId,
    req.user?.id,
    req.query
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Connection disconnected',
    data: result,
  });
});

export const NetworkConnectionController = {
  sendRequest,
  updateStatus,
  remove,
  getAll,
  getById,
  cancelRequest,
  disconnect,
  getUserAllNetworks,
};
