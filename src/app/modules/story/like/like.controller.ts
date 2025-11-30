import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { StoryLikeService } from './like.service';

const toggleLike = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { storyId } = req.params;
    const userId = req.user?.id;

    // Check if user has already liked the story
    const hasLiked = await StoryLikeService.hasUserLiked(storyId, userId);

    let result;
    let message;

    if (hasLiked) {
      result = await StoryLikeService.deleteLike(storyId, userId);
      message = 'Story unliked successfully';
    } else {
      result = await StoryLikeService.createLike(storyId, userId);
      message = 'Story liked successfully';
    }

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message,
      data: result,
    });
  }
);

const getStoryLikes = catchAsync(async (req: Request, res: Response) => {
  const { storyId } = req.params;
  const query = req.query;
  const likes = await StoryLikeService.getLikesByStory(storyId, query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Story likes retrieved successfully',
    pagination: likes.pagination,
    data: likes.data,
  });
});

const getUserLikeStatus = catchAsync(async (req: Request, res: Response) => {
  const { storyId } = req.params;
  const userId = req.user?.id;

  const hasLiked = await StoryLikeService.hasUserLiked(storyId, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User like status retrieved successfully',
    data: { hasLiked },
  });
});

export const StoryLikeController = {
  toggleLike,
  getStoryLikes,
  getUserLikeStatus,
};

