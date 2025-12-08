import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { TaskCalenderService } from './TaskCalender.service';

const createTaskCalender = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;

  const result = await TaskCalenderService.createTaskCalender(data,req?.user?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Task calendar created successfully',
    data: result,
  });
});

const getAllTaskCalenders = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, any>;
  const { data, pagination } = await TaskCalenderService.getAllTaskCalenders(
    query
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Task calendars retrieved successfully',
    pagination,
    data,
  });
});

const getSingleTaskCalender = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await TaskCalenderService.findById(id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Task calendar retrieved successfully',
      data: result,
    });
  }
);

const updateTaskCalender = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await TaskCalenderService.updateTaskCalender(
    req.params.id,
    payload
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Task calendar updated successfully',
    data: result,
  });
});

const deleteTaskCalender = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskCalenderService.deleteTaskCalender(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Task calendar deleted successfully',
    data: result,
  });
});

const getTaskCalendersByYearAndMonth = catchAsync(
  async (req: Request, res: Response) => {
    const { year, month } = req.params;
    const query = req.query as Record<string, any>;
    const result = await TaskCalenderService.getTaskCalendersByYearAndMonth(
      Number(year),
      Number(month),
      query
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Task calendars retrieved successfully',
      pagination: result.pagination,
      data: result.data,
    });
  }
);

export const TaskCalenderController = {
  createTaskCalender,
  getAllTaskCalenders,
  getSingleTaskCalender,
  updateTaskCalender,
  deleteTaskCalender,
  getTaskCalendersByYearAndMonth,
};

