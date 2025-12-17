import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { FavouriteService } from './favourite.service';

const toggleFavourite = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { handle } = req.params;
    const userId = req.user?.id;

    const hasFavourited = await FavouriteService.hasUserFavourited(
      handle,
      userId
    );

    let result;
    let message;

    if (hasFavourited) {
      result = await FavouriteService.deleteFavourite(handle, userId);
      message = 'Meal removed from favourites successfully';
    } else {
      result = await FavouriteService.createFavourite(handle, userId);
      message = 'Meal added to favourites successfully';
    }

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message,
      data: result,
    });
  }
);

const getUserFavourites = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const query = req.query;

  const favourites = await FavouriteService.getUserFavourites(userId, query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User favourites retrieved successfully',
    pagination: favourites.pagination,
    data: favourites.data,
  });
});

const getUserFavouriteStatus = catchAsync(async (req: Request, res: Response) => {
  const { mealId } = req.params;
  const userId = req.user?.id;

  const hasFavourited = await FavouriteService.hasUserFavourited(
    mealId,
    userId
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User favourite status retrieved successfully',
    data: { hasFavourited: !!hasFavourited },
  });
});

export const FavouriteController = {
  toggleFavourite,
  getUserFavourites,
  getUserFavouriteStatus,
};

