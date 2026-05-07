import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { Calendar } from './calender.model';
import { ICalendar } from './calender.interface';

const createCalendarEvent = async (payload: ICalendar, userId: string) => {
  // Attach userId
  (payload as any).user = userId;

  const calendarEvent = await Calendar.create(payload);
  return calendarEvent;
};

const getAllCalendarEvents = async (userId: string, query: Record<string, any>) => {
  // Build base query with user filter
  const calendarQuery = Calendar.find({ user: userId });
  
  // Create QueryBuilder instance
  const queryBuilder = new QueryBuilder(calendarQuery, query)
    .search(['title', 'note'])
    .filter()
    .sort()
    .paginate()
    .fields();

  // Get events and pagination info
  const events = await queryBuilder.modelQuery;
  const pagination = await queryBuilder.getPaginationInfo();

  return {
    data: events,
    pagination,
  };
};

const getCalendarEventById = async (id: string, userId: string) => {
  const event = await Calendar.findOne({ _id: id, user: userId });
  
  if (!event) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Calendar event not found'
    );
  }
  
  return event;
};

const updateCalendarEvent = async (id: string, payload: Partial<ICalendar>, userId: string) => {
  const event = await Calendar.findOne({ _id: id, user: userId });
  
  if (!event) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Calendar event not found'
    );
  }

  const updatedEvent = await Calendar.findByIdAndUpdate(
    id,
    payload,
    { new: true, runValidators: true }
  );

  return updatedEvent;
};

const deleteCalendarEvent = async (id: string, userId: string) => {
  const event = await Calendar.findOne({ _id: id, user: userId });
  
  if (!event) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Calendar event not found'
    );
  }

  await Calendar.findByIdAndDelete(id);
  
  return { success: true, message: 'Calendar event deleted successfully' };
};

const updateEventStatus = async (id: string, status: 'upcoming' | 'pending' | 'completed', userId: string) => {
  const event = await Calendar.findOne({ _id: id, user: userId });
  
  if (!event) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Calendar event not found'
    );
  }

  const updatedEvent = await Calendar.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  return updatedEvent;
};

export const CalendarService = {
  createCalendarEvent,
  getAllCalendarEvents,
  getCalendarEventById,
  updateCalendarEvent,
  deleteCalendarEvent,
  updateEventStatus
};
