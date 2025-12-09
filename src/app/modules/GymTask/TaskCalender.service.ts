import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';

import dayjs from 'dayjs';
import { TaskCalendar } from './TaskCalender.model';
import { ITaskCalendar } from './TaskCalender.interface';
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const createTaskCalendar = async (payload: ITaskCalendar, userId: string) => {
  const { year, month, selectedStartDate, selectedEndDate, isCheckedToday } = payload;

  // Attach userId
  (payload as any).user = userId;

  // Always use UTC for clean MongoDB date storage
  const today = dayjs.utc().startOf('day');
  const start = dayjs.utc(selectedStartDate).startOf('day');
  const end = dayjs.utc(selectedEndDate).startOf('day');

  // Validate year & month not in the past
  const thisYear = today.year();
  const thisMonth = today.month() + 1;

  if (year < thisYear || (year === thisYear && month < thisMonth)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot select a year/month before today');
  }

  // Validate start/end dates not before today
  if (start.isBefore(today)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'selectedStartDate cannot be before today');
  }

  if (end.isBefore(today)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'selectedEndDate cannot be before today');
  }

  // Validate dates order
  if (end.isBefore(start)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'selectedEndDate must be after selectedStartDate');
  }

  // Validate isCheckedToday
  const todayIsInRange =
    today.isSame(start) ||
    today.isSame(end) ||
    (today.isAfter(start) && today.isBefore(end));

  if (isCheckedToday && !todayIsInRange) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Cannot check today because today is not within the selected start and end dates'
    );
  }

  // Check if a calendar already exists
  let existingTask = await TaskCalendar.findOne({ user: userId, year, month });

  // ------------------------------------------
  // IF NOT EXISTS → CREATE NEW CALENDAR
  // ------------------------------------------
  if (!existingTask) {
    payload.selectedWorkoutDates = [];

    if (isCheckedToday) {
      payload.selectedWorkoutDates.push(today.toDate());
    }

    const taskCalendar = await TaskCalendar.create(payload);
    return taskCalendar;
  }

  // ------------------------------------------
  // IF EXISTS → UPDATE CALENDAR
  // ------------------------------------------
  existingTask.selectedStartDate = selectedStartDate;
  existingTask.selectedEndDate = selectedEndDate;

  if (!Array.isArray(existingTask.selectedWorkoutDates)) {
    existingTask.selectedWorkoutDates = [];
  }

  const todayDate = today.toDate();

  if (isCheckedToday) {
    const alreadyExists = existingTask.selectedWorkoutDates.some(d =>
      dayjs(d).isSame(today, 'day')
    );

    if (!alreadyExists) {
      existingTask.selectedWorkoutDates.push(todayDate);
    }
  } else {
    // Remove today's date if user unchecks
    existingTask.selectedWorkoutDates = existingTask.selectedWorkoutDates.filter(
      d => !dayjs(d).isSame(today, 'day')
    );
  }

  await existingTask.save();
  return existingTask;
};


const updateTaskCalender = async (
  id: string,
  payload: Partial<ITaskCalendar>
) => {
  const existing = await TaskCalendar.findById(id).lean();
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Task calendar not found');
  }

  const updated = await TaskCalendar.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Task calendar not found');
  }
  return updated;
};

const deleteTaskCalender = async (taskCalenderId: string) => {
  const deleted = await TaskCalendar.findByIdAndDelete(taskCalenderId);

  if (!deleted) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Task calendar not found or you do not have permission to delete this task calendar'
    );
  }

  return deleted;
};

const findById = async (taskCalenderId: string) => {
  const taskCalender = await TaskCalendar.findById(taskCalenderId).lean();
  if (!taskCalender) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Task calendar not found');
  }
  return taskCalender;
};

const getAllTaskCalenders = async (query: Record<string, any>) => {
  const { year, month } = query;

  if (!year || !month) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Year and month are required');
  }

  // Find TaskCalendar
  const taskCalendar = await TaskCalendar.findOne({ year, month }).lean();

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Corresponding workout types for each day (order: Mon, Tue, Wed, Thu, Fri, Sat, Sun)
  const weekWork: Record<string, string> = {
    Mon: 'pull',
    Tue: 'push',
    Wed: 'rest',
    Thu: 'push',
    Fri: 'pull',
    Sat: 'rest',
    Sun: 'leg'
  };

  const today = dayjs().startOf('day');

  // Get Monday of the current week
  const startOfWeek =
    today.day() === 0
      ? today.subtract(6, 'day') // If Sunday -> go back 6 days
      : today.subtract(today.day() - 1, 'day');

  // Prepare selected workout dates as formatted strings
  const selectedDatesSet = new Set(
    Array.isArray(taskCalendar?.selectedWorkoutDates)
      ? taskCalendar.selectedWorkoutDates.map((d: any) =>
          dayjs(d).startOf('day').format('YYYY-MM-DD')
        )
      : []
  );

  // Create final week result
  const days = weekDays.map((label, idx) => {
    const dateObj = dayjs(startOfWeek).add(idx, 'day'); // clone to avoid mutation
    const formatted = dateObj.format('YYYY-MM-DD');
    const isActive = dateObj.isSame(today, 'day');
    const result: any = {
      day: label,
      date: formatted,
      selected: selectedDatesSet.has(formatted),
      work: weekWork[label]
    };
    if (isActive) {
      result.active = true;
    }
    return result;
  });

  return { data: days };
};


const getTaskCalendersByYearAndMonth = async (
  year: number,
  month: number,
  query: Record<string, any>
) => {
  const findQuery: any = {
    year,
    month,
  };

  const taskCalenderQuery = new QueryBuilder(
    TaskCalendar.find(findQuery),
    query
  )
    .fields()
    .filter()
    .sort()
    .paginate();

  const data = await taskCalenderQuery.modelQuery.lean();
  const pagination = await taskCalenderQuery.getPaginationInfo();

  return {
    data,
    pagination,
  };
};

export const TaskCalenderService = {
  createTaskCalendar,
  updateTaskCalender,
  deleteTaskCalender,
  findById,
  getAllTaskCalenders,
  getTaskCalendersByYearAndMonth,
};

