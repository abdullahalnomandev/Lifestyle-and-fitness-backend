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


  // Check if a calendar already exists
  let existingTask = await TaskCalendar.findOne({ user: userId, year, month });

  // Validate start/end dates not before today
  if (!existingTask && start.isBefore(today)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'selectedStartDate cannot be before today');
  }

  if (!existingTask && end.isBefore(today)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'selectedEndDate cannot be before today');
  }

  // Validate dates order
  if (!existingTask && end.isBefore(start)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'selectedEndDate must be after selectedStartDate');
  }

  // Validate isCheckedToday
  const todayIsInRange = today.isSame(start) || today.isSame(end) || (today.isAfter(start) && today.isBefore(end));

  if (isCheckedToday && !todayIsInRange) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Cannot check today because today is not within the selected start and end dates'
    );
  }

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


const uploadWorkoutPicture = async (user: any, images: string[]) => {
  const userId = user?.id;

  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
  }

  const taskCalendar = await TaskCalendar.findOne({ user: userId });

  if (!taskCalendar) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Task calendar not found for user');
  }

  console.log('Uploading images:', images);

  // Push directly into the array of the document instance
  taskCalendar.workoutPictures.push(
    ...images.map(img => ({ date: new Date(), image: img }))
  );

  await taskCalendar.save();

  return taskCalendar;
};



const getWorkoutProgress = async (userId: string, query: Record<string, any>) => {
  const getBy = query.getBy;

  if (!getBy || !["weekly", "monthly", "yearly", "all"].includes(getBy)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Valid getBy: weekly/monthly/yearly/all");
  }

  const taskCalendar = await TaskCalendar.findOne({ user: userId });

  if (!taskCalendar) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Task calendar not found for user");
  }

  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (getBy === "weekly") {
    startDate = dayjs().startOf("week").toDate();
    endDate = dayjs().endOf("week").toDate();
  } else if (getBy === "monthly") {
    startDate = dayjs().startOf("month").toDate();
    endDate = dayjs().endOf("month").toDate();
  } else if (getBy === "yearly") {
    startDate = dayjs().startOf("year").toDate();
    endDate = dayjs().endOf("year").toDate();
  }

  // Filter pure Date array (selectedWorkoutDates, targetedWorkoutDates)
  const filterDateArray = (dates: Date[]) => {
    if (getBy === "all") return dates;
    return dates.filter((d) => d >= startDate! && d <= endDate!);
  };

  // Filter objects containing { date: Date } (workoutPictures)
  const filterPictureArray = (items: { date: Date; image: string }[]) => {
    if (getBy === "all") return items;
    return items.filter((item) => {
      const d = new Date(item.date);
      return d >= startDate! && d <= endDate!;
    });
  };

  // Apply filters
  const targeted = filterDateArray(taskCalendar.targetedWorkoutDates || []);
  const completed = filterDateArray(taskCalendar.selectedWorkoutDates || []);
  const pictures = filterPictureArray(taskCalendar.workoutPictures || []);


  return {
    getBy,
    targeted: targeted.length,
    completed: completed.length,
    pictures: pictures.length,
    workoutPictures: pictures,
  };
};



export const TaskCalenderService = {
  createTaskCalendar,
  getAllTaskCalenders,
  uploadWorkoutPicture,
  getWorkoutProgress

};

