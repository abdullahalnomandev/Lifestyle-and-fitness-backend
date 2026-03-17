import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { BlockService } from './block.service';

// CREATE BLOCK
const createBlock = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const blockedId = req.params.userId; // user to block
    const blockerId = req.user?.id; // currently logged-in user

    const result = await BlockService.createBlock(blockerId!, blockedId, req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'User blocked successfully',
      data: result,
    });
  }
);

// GET BLOCKS BY USER
const getBlocksByUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const query = req.query;

  const blocks = await BlockService.getBlocksByUser(userId, query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User blocks retrieved successfully',
    pagination: blocks.pagination,
    data: blocks.data,
  });
});

// GET ALL BLOCKS (ADMIN)
const getAllBlocks = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const blocks = await BlockService.getAllBlocks(query , req.user?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All blocks retrieved successfully',
    pagination: blocks.pagination,
    data: blocks.data,
  });
});

// DELETE BLOCK
const deleteBlock = catchAsync(async (req: Request, res: Response) => {
  const { blockId } = req.params;

  const result = await BlockService.deleteBlock(blockId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Block deleted successfully',
    data: result,
  });
});

export const BlockController = {
  createBlock,
  getBlocksByUser,
  getAllBlocks,
  deleteBlock,
  
};