import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CalendarService } from './calender.service';

const createCalendarEvent = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const userId = req?.user?.id as string;

  const result = await CalendarService.createCalendarEvent(data, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Calendar event created successfully',
    data: result,
  });
});

const getAllCalendarEvents = catchAsync(async (req: Request, res: Response) => {
  const userId = req?.user?.id as string;
  const query = req.query as Record<string, any>;
  
  const result = await CalendarService.getAllCalendarEvents(userId, query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Calendar events retrieved successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

const getCalendarEventById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req?.user?.id as string;

  const result = await CalendarService.getCalendarEventById(id, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Calendar event retrieved successfully',
    data: result,
  });
});

const updateCalendarEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const userId = req?.user?.id as string;

  const result = await CalendarService.updateCalendarEvent(id, data, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Calendar event updated successfully',
    data: result,
  });
});

const deleteCalendarEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req?.user?.id as string;

  const result = await CalendarService.deleteCalendarEvent(id, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result,
  });
});

const updateEventStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req?.user?.id as string;

  const result = await CalendarService.updateEventStatus(id, status, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Calendar event status updated successfully',
    data: result,
  });
});

export const CalendarController = {
  createCalendarEvent,
  getAllCalendarEvents,
  getCalendarEventById,
  updateCalendarEvent,
  deleteCalendarEvent,
  updateEventStatus,
};
