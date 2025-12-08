import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { ITaskCalender } from './TaskCalender.interface';
import { TaskCalender } from './TaskCalender.model';

import dayjs from 'dayjs';

const createTaskCalender = async (payload: ITaskCalender, userId: string) => {
  const { year, month, isCheckedToday,seletectedWorkoutDates } = payload;
     (payload as any).user = userId;

  const today = dayjs().startOf('day');
  const isToday = () => dayjs(today.toDate()).isSame(dayjs(), 'day');

  // Try to find existing calendar for this user, year, and month
  let isTaskExist = await TaskCalender.findOne({ user: userId, year, month });

  
  if(isCheckedToday && !isToday){
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You can not check without today');
  }

    if (!isTaskExist ) {
      if (isCheckedToday && isToday()) {
        payload.seletectedWorkoutDates = [
          ...(payload.seletectedWorkoutDates || []),
          today.toDate(),
        ];
      }
    }

  return taskCalender;
};

const updateTaskCalender = async (
  id: string,
  payload: Partial<ITaskCalender>
) => {
  const existing = await TaskCalender.findById(id).lean();
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Task calendar not found');
  }

  const updated = await TaskCalender.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Task calendar not found');
  }
  return updated;
};

const deleteTaskCalender = async (taskCalenderId: string) => {
  const deleted = await TaskCalender.findByIdAndDelete(taskCalenderId);

  if (!deleted) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Task calendar not found or you do not have permission to delete this task calendar'
    );
  }

  return deleted;
};

const findById = async (taskCalenderId: string) => {
  const taskCalender = await TaskCalender.findById(taskCalenderId).lean();
  if (!taskCalender) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Task calendar not found');
  }
  return taskCalender;
};

const getAllTaskCalenders = async (query: Record<string, any>) => {
  const taskCalenderQuery = new QueryBuilder(TaskCalender.find(), query)
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
    TaskCalender.find(findQuery),
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
  createTaskCalender,
  updateTaskCalender,
  deleteTaskCalender,
  findById,
  getAllTaskCalenders,
  getTaskCalendersByYearAndMonth,
};

