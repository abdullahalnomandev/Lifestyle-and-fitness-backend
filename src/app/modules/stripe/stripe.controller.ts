import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StripeService } from './stripe.service';

const getAccountLink = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const result = await StripeService.createAccountLink(userId,req.params.clubId);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Account link created successfully',
        data: result,
    });
});

export const StripeController = {
    getAccountLink
};