import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';

import dayjs from 'dayjs';
import { TaskCalendar } from './TaskCalender.model';
import { ITaskCalendar } from './TaskCalender.interface';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const createTaskCalendar = async (payload: ITaskCalendar, userId: string) => {
  const { year, month, isCheckedToday } = payload;

  // Always use UTC for clean MongoDB date storage
  const today = dayjs.utc().startOf('day');
  const start = dayjs.utc(payload.selectedStartDate).startOf('day');
  const end = dayjs.utc(payload.selectedEndDate).startOf('day');

  // Save selectedStartDate and selectedEndDate as UTC in payload
  payload.selectedStartDate = start.toDate();
  payload.selectedEndDate = end.toDate();

  // Attach userId
  (payload as any).user = userId;

  // Validate year & month not in the past
  const thisYear = today.year();
  const thisMonth = today.month() + 1;

  if (year < thisYear || (year === thisYear && month < thisMonth)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Cannot select a year/month before today'
    );
  }

  // Check if a calendar already exists
  let existingTask = await TaskCalendar.findOne({ user: userId, year, month });

  // Validate start/end dates not before today
  if (!existingTask && start.isBefore(today)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'selectedStartDate cannot be before today'
    );
  }

  if (!existingTask && end.isBefore(today)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'selectedEndDate cannot be before today'
    );
  }

  // Validate dates order
  if (!existingTask && end.isBefore(start)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'selectedEndDate must be after selectedStartDate'
    );
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

  // Utility to build array of all days from start (inclusive) to end (inclusive)
  const getRangeDates = (startD: any, endD: any) => {
    const arr = [];
    let cursor = startD.clone();
    while (cursor.isBefore(endD) || cursor.isSame(endD, 'day')) {
      arr.push(cursor.toDate());
      cursor = cursor.add(1, 'day');
    }
    return arr;
  };

  // --------
  // IF NOT EXISTS → CREATE NEW CALENDAR
  // --------
  if (!existingTask) {
    payload.selectedWorkoutDates = [];

    if (isCheckedToday) {
      payload.selectedWorkoutDates.push(today.toDate());
    }

    // New logic: initialize targetedWorkoutDates with the selected date range
    (payload as any).targetedWorkoutDates = getRangeDates(start, end);

    const taskCalendar = await TaskCalendar.create(payload);
    return taskCalendar;
  }

  // --------
  // IF EXISTS → UPDATE CALENDAR
  // --------
  // Always save selectedStartDate and selectedEndDate as UTC
  existingTask.selectedStartDate = start.toDate();
  existingTask.selectedEndDate = end.toDate();

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
    existingTask.selectedWorkoutDates =
      existingTask.selectedWorkoutDates.filter(
        d => !dayjs(d).isSame(today, 'day')
      );
  }

  // ---- targetedWorkoutDates logic ----

  // Build the new range to add
  const newRange = getRangeDates(start, end);

  // If no targetedWorkoutDates, just assign
  if (!Array.isArray((existingTask as any).targetedWorkoutDates)) {
    (existingTask as any).targetedWorkoutDates = [];
  }

  const prevTargeted = (existingTask as any).targetedWorkoutDates || [];

  // Add only new dates, avoid duplicates by date (YYYY-MM-DD)
  const prevSet = new Set(
    prevTargeted.map((d: any) => dayjs(d).utc().format('YYYY-MM-DD'))
  );
  for (const d of newRange) {
    const fmt = dayjs(d).utc().format('YYYY-MM-DD');
    if (!prevSet.has(fmt)) {
      (existingTask as any).targetedWorkoutDates.push(d);
      prevSet.add(fmt);
    }
  }

  // Make sure targetedWorkoutDates is de-duplicated on date only
  // (in case of legacy or data issues)
  (existingTask as any).targetedWorkoutDates = Array.from(
    (existingTask as any).targetedWorkoutDates
      .reduce((acc: Map<string, Date>, d: any) => {
        const fmt = dayjs(d).utc().format('YYYY-MM-DD');
        if (!acc.has(fmt)) acc.set(fmt, dayjs(d).utc().toDate());
        return acc;
      }, new Map())
      .values()
  );

  await existingTask.save();
  return existingTask;
};

const getAllTaskCalenders = async (query: Record<string, any>) => {
  let year = query.year;
  let month = query.month;

  if (!year || !month) {
    const now = dayjs();
    year = now.year();
    month = now.month() + 1; // dayjs months are 0-based, add 1 for consistency
  }

  // Find TaskCalendar for the requested year and month
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
    Sun: 'leg',
  };

  const today = dayjs().startOf('day');
  const currentYear = today.year();
  const currentMonth = today.month() + 1; // dayjs .month() is 0-based

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

  // Only show "active: true" if
  // 1. The requested year and month are the current year and month
  // 2. There is a taskCalendar in DB for this year/month
  // 3. The date is today's date
  const isCurrentYearMonth =
    Number(year) === currentYear && Number(month) === currentMonth;

  const validTaskCalendar = !!taskCalendar;

  const days = weekDays.map((label, idx) => {
    const dateObj = dayjs(startOfWeek).add(idx, 'day');
    const formatted = dateObj.format('YYYY-MM-DD');
    const isActiveDay = dateObj.isSame(today, 'day');

    const result: any = {
      day: label,
      // date: formatted,
      selected: selectedDatesSet.has(formatted),
      work: weekWork[label],
    };

    // Only add 'active: true' when all conditions met
    if (
      isActiveDay &&
      isCurrentYearMonth &&
      validTaskCalendar
    ) {
      result.active = true;
    }
    return result;
  });

  return { 
    data: { 
      year: Number(year ?? taskCalendar?.year),
      month: Number(month ?? taskCalendar?.month),
      selectedStartDate: taskCalendar?.selectedStartDate,
      selectedEndDate: taskCalendar?.selectedEndDate,
      days,
    } 
  };
};

const uploadWorkoutPicture = async (user: any, image: string, caption: string, year?: number, month?: number) => {
  const userId = user?.id;

  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
  }

  // Get current year/month if not provided
  const now = dayjs();
  const thisYear = year ?? now.year();
  const thisMonth = month ?? now.month() + 1; // dayjs months are 0-based

  const anyTaskCalendar = await TaskCalendar.findOne({ user: userId });
  if (!anyTaskCalendar) {
    throw new ApiError(StatusCodes.NOT_FOUND, "You don't have any workout.");
  }

  let taskCalendar = await TaskCalendar.findOne({ user: userId, year: thisYear, month: thisMonth });

  if (!taskCalendar) {
    taskCalendar = await TaskCalendar.findOne({ user: userId });
    if (!taskCalendar) {
      throw new ApiError(StatusCodes.NOT_FOUND, "You don't have any workout.");
    }
  }

  taskCalendar.workoutPictures.push({
    date: new Date(),
    image,
    caption
  });

  await taskCalendar.save();

  return taskCalendar;
};


const deleteWorkoutPicture = async (userId: string, pictureId: string) => {
  if (!userId || !pictureId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid request');
  }

  const result = await TaskCalendar.updateMany(
    {
      user: userId,
      "workoutPictures._id": pictureId
    },
    {
      $pull: { workoutPictures: { _id: pictureId } }
    }
  );

  if (result.modifiedCount === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Workout picture not found');
  }

  return {
    success: true,
    deletedFromCalendars: result
  };
};

const updateWorkoutPicture = async (
  userId: string,
  pictureId: string,
  data: { image?: string; caption?: string }
) => {
  if (!userId || !pictureId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid request');
  }

  if (!data.image && !data.caption) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Nothing to update');
  }

  const updateFields: any = {};

  if (data.image) {
    updateFields["workoutPictures.$[pic].image"] = data.image;
  }

  if (data.caption) {
    updateFields["workoutPictures.$[pic].caption"] = data.caption;
  }

  const result = await TaskCalendar.updateMany(
    {
      user: userId,
      "workoutPictures._id": pictureId
    },
    {
      $set: updateFields
    },
    {
      arrayFilters: [{ "pic._id": pictureId }]
    }
  );

  if (result.modifiedCount === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Workout picture not found');
  }

  return {
    success: true,
    updatedInCalendars: result.modifiedCount
  };
};


const getWorkoutProgress = async (
  userId: string,
  query: Record<string, any>
) => {
  const getBy = query.getBy;

  if (!getBy || !['weekly', 'monthly', 'yearly', 'all'].includes(getBy)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Valid getBy: weekly/monthly/yearly/all'
    );
  }

  // Find ALL TaskCalendars for this user
  const taskCalendars = await TaskCalendar.find({ user: userId });

  if (!taskCalendars || taskCalendars.length === 0) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Task calendar not found for user'
    );
  }

  // Get proper start and end of current week/month/year using local time
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (getBy === 'weekly') {
    startDate = dayjs().startOf('week').toDate();
    endDate = dayjs().endOf('week').toDate();
  } else if (getBy === 'monthly') {
    startDate = dayjs().startOf('month').toDate();
    endDate = dayjs().endOf('month').toDate();
  } else if (getBy === 'yearly') {
    startDate = dayjs().startOf('year').toDate();
    endDate = dayjs().endOf('year').toDate();
  }

  // Filters should compare by same date type (all timestamps)
  const filterDateArray = (dates: Date[]) => {
    if (getBy === 'all') return dates;
    return dates.filter(d => {
      const src = (d instanceof Date) ? d.getTime() : new Date(d).getTime();
      return startDate && endDate && src >= startDate.getTime() && src <= endDate.getTime();
    });
  };

  const filterPictureArray = (items: { date: Date; image: string }[]) => {
    if (getBy === 'all') return items;
    return items.filter(item => {
      const dt = (item.date instanceof Date) ? item.date.getTime() : new Date(item.date).getTime();
      return startDate && endDate && dt >= startDate.getTime() && dt <= endDate.getTime();
    });
  };

  // Aggregate all arrays from ALL calendars
  let allTargeted: Date[] = [];
  let allCompleted: Date[] = [];
  let allPictures: { date: Date; image: string }[] = [];

  for (const cal of taskCalendars) {
    if (Array.isArray(cal.targetedWorkoutDates)) {
      allTargeted.push(...cal.targetedWorkoutDates);
    }
    if (Array.isArray(cal.selectedWorkoutDates)) {
      allCompleted.push(...cal.selectedWorkoutDates);
    }
    if (Array.isArray(cal.workoutPictures)) {
      allPictures.push(...cal.workoutPictures);
    }
  }

  const targeted = filterDateArray(allTargeted);
  const completed = filterDateArray(allCompleted);
  let pictures = filterPictureArray(allPictures);

  // Sort workoutPictures by date (descending: latest first)
  pictures = pictures.sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
    const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
    return dateB - dateA;
  });

  return {
    getBy,
    targeted: targeted.length,
    completed: completed.length,
    pictures: pictures.length,
    workoutPictures: pictures
  };
};


export const TaskCalenderService = {
  createTaskCalendar,
  getAllTaskCalenders,
  uploadWorkoutPicture,
  getWorkoutProgress,
  deleteWorkoutPicture,
  updateWorkoutPicture
};
