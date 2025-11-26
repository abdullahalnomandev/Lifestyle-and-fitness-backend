import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { LikeService } from './like.service';

const toggleLike = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const { fcmToken } = req.query;
    const userId = req.user?.id;

    // Check if user has already liked the post
    const hasLiked = await LikeService.hasUserLiked(postId, userId);

    let result;
    let message;

    if (hasLiked) {
      result = await LikeService.deleteLike(postId, userId);
      message = 'Post unliked successfully';
    } else {
      result = await LikeService.createLike(postId, userId,fcmToken as string);
      message = 'Post liked successfully';
    }

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message,
      data: result,
    });
  }
);

const getPostLikes = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const query = req.query;
  const likes = await LikeService.getLikesByPost(postId, query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post likes retrieved successfully',
    pagination: likes.pagination,
    data: likes.data,
  });
});

const getUserLikeStatus = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const userId = req.user?.id;

  const hasLiked = await LikeService.hasUserLiked(postId, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User like status retrieved successfully',
    data: { hasLiked },
  });
});

export const LikeController = {
  toggleLike,
  getPostLikes,
  getUserLikeStatus,
};
