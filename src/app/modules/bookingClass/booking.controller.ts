import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { BookingClassService } from './booking.service';
import { BookingClassCardService } from './booking.stripe';

const createBookingClass = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const origin = `${req.protocol}://${req.get('host')}`;
        const result = await BookingClassService.createBookingClass({ ...req.body, user: req.user?.id }, origin);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Booking class created successfully',
            data: result,
        });
    }
);



const orderSuccess = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const bookingId = req.query.bookingId as string;
        const status = req.query.status as string;
        await BookingClassCardService.bookConfirm(bookingId, status, res);
    }
);

const orderCancel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const bookingId = req.query.bookingId as string;
    const status = req.query.status as string;
    await BookingClassCardService.bookCancel(bookingId, status, res);
}
);

const addToWaitingList = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const result = await BookingClassService.addToWaitingList({ ...req.body, user: req.user?.id });

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Added to waiting list successfully',
            data: result,
        });
    }
);


const getAllBookingAttendance = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const clubId = req.params.club_id;
        const classId = req.params.class_id;
        const classStartDate = req.params.class_start_date;

        const result = await BookingClassService.getAllBookingAttendance(userId, clubId, classId, classStartDate as any, req.query);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Booking attendance retrieved successfully',
            pagination: result.pagination,
            data: {
                attandence: result.attancence,
                result: result.result,
            },
        });
    }
);

const cancelAttendence = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const classBookingRefId = req.params.class_booking_ref_id;
        const userId = req.user?.id;
        const result = await BookingClassService.cancelAttendence(userId, classBookingRefId);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Attendance cancelled successfully',
            data: result,
        });
    }
);

const getBookingAttendance = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const classBookingRefId = req.params.class_booking_ref_id;
        const userId = req.user?.id;
        const result = await BookingClassService.getBookingAttendance(userId, classBookingRefId);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Booking attendance retrieved successfully',
            data: result,
        });
    }
);



export const ClassController = {
    createBookingClass,
    orderSuccess,
    orderCancel,
    addToWaitingList,
    getAllBookingAttendance,
    cancelAttendence,
    getBookingAttendance,
};
