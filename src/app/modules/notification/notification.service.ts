import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { Notification } from './notification.mode';

const getMyNotifications = async (userId: string, query: Record<string, any>) => {
  const notificationQuery = new QueryBuilder(
    Notification.find({ receiver: userId },'-deleteReferenceId').populate('sender', 'name image').lean(),
    query
  )
    .paginate()
    .fields()
    .filter()
    .sort();

  const notifications = await notificationQuery.modelQuery;

  const unreadCount = await Notification.countDocuments({ recipient: userId, seen: false });

  const pagination = await notificationQuery.getPaginationInfo();

  return {
    data: notifications,
    pagination,
    unreadCount,
  };
};

const markAsSeen = async (userId: string, notificationId: string) => {
  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { seen: true },
    { new: true }
  ).lean();

  if (!notification) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found or access denied');
  }
  

  return notification;
};

export const NotificationService = {
  getMyNotifications,
  markAsSeen,
};
