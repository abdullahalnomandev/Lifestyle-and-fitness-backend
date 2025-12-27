import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { INetworkConnection } from './interface';
import { NetworkConnection } from './networkConnetion.model';
import {
  NETWORK_CONNECTION_STATUS,
  networkUserSearchableField,
} from './networkConnetion.constant';
import { User } from '../user/user.model';
import { Notification } from '../notification/notification.mode';
import { NotificationCount } from '../notification/notificationCountModel';

const sendRequestToDB = async (payload: INetworkConnection) => {
  if (!payload.requestFrom || !payload.requestTo) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Both requestFrom and requestTo are required'
    );
  }

  if (payload.requestFrom.toString() === payload.requestTo.toString()) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You cannot send a connection request to yourself'
    );
  }

  const existing = await NetworkConnection.findOne({
    $or: [
      { requestFrom: payload.requestFrom, requestTo: payload.requestTo },
      { requestFrom: payload.requestTo, requestTo: payload.requestFrom },
    ],
  });

  if (existing) {
    if (existing.status === NETWORK_CONNECTION_STATUS.ACCEPTED) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Users are already connected'
      );
    }

    if (existing.status === NETWORK_CONNECTION_STATUS.PENDING) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Connection request is already pending'
      );
    }

    existing.requestFrom = payload.requestFrom;
    existing.requestTo = payload.requestTo;
    existing.status = NETWORK_CONNECTION_STATUS.PENDING;
    const saved = await existing.save();

    // Create notification when a connection request is (re)sent
    Notification.create({
      receiver: payload.requestTo,
      sender: payload.requestFrom,
      title: 'New connection request',
      message: 'You have received a connection request.',
      refId: saved._id,
      deleteReferenceId: saved._id,
      path: `/user/network/request/${saved._id}`,
    });

    // Track notification count for the recipient (payload.requestTo)
    // Track notification count for the recipient (payload.requestTo)
    const user = payload.requestTo;
    const existingCount = await NotificationCount.findOne({ user });

    if (existingCount) {
      existingCount.count += 1;
      await existingCount.save();
    } else {
      await NotificationCount.create({ user, count: 1 });
    }

    return saved;
  }

  // Create new connection request
  const connection = await NetworkConnection.create(payload);

  // Create notification when a new connection request is sent
  Notification.create({
    receiver: payload.requestTo,
    sender: payload.requestFrom,
    title: 'New connection request',
    message: 'You have received a connection request.',
    refId: connection._id,
    deleteReferenceId: connection._id,
    path: `/user/network/request/${connection._id}`,
  });

  // Track notification count for the recipient (payload.requestTo)
  const user = payload.requestTo;
  const existingCount = await NotificationCount.findOne({ user });

  if (existingCount) {
    existingCount.count += 1;
    await existingCount.save();
  } else {
    await NotificationCount.create({ user, count: 1 });
  }

  return connection;
};

const updateStatusInDB = async (
  id: string,
  userId: string,
  status: (typeof NETWORK_CONNECTION_STATUS)[keyof typeof NETWORK_CONNECTION_STATUS]
) => {
  const connection = await NetworkConnection.findById(id);

  if (!connection) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Connection not found');
  }

  // Only the user who is the recipient of the request can accept or reject it
  if (connection.requestTo.toString() !== userId.toString()) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You do not have permission to modify this connection status'
    );
  }

  connection.status = status;
  if (connection.status === NETWORK_CONNECTION_STATUS.ACCEPTED) {
    // Create a notification to let the sender know their request was accepted
    await Notification.create({
      receiver: connection.requestFrom,
      sender: connection.requestTo,
      title: 'Connection request accepted',
      message: 'Your connection request has been accepted.',
      refId: connection._id,
      deleteReferenceId: connection._id,
      path: `/user/network/request/${connection._id}`,
    });

    // Update notification count for the sender (connection.requestFrom)
    const user = connection.requestFrom;
    const existingCount = await NotificationCount.findOne({ user });

    if (existingCount) {
      existingCount.count += 1;
      await existingCount.save();
    } else {
      await NotificationCount.create({ user, count: 1 });
    }
  }
  await connection.save();

  return connection;
};

const deleteFromDB = async (id: string) => {
  const deleted = await NetworkConnection.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Connection not found');
  }
  return deleted;
};

const getAllFromDB = async (query: Record<string, any>, userId: string) => {
  // Extract searchTerm so we can search on User collection (refs), not on the raw ObjectId fields.
  const { searchTerm, ...restQuery } = query;

  let baseFilter: Record<string, any> = {
    $or: [{ requestFrom: userId }, { requestTo: userId }],
  };

  // If searchTerm is provided, find matching users by name and filter connections
  if (searchTerm) {
    const matchedUsers = await User.find({
      name: { $regex: searchTerm, $options: 'i' },
    })
      .select('_id')
      .lean();

    const matchedUserIds = matchedUsers.map(u => u._id);

    if (matchedUserIds.length === 0) {
      // No matching users – return empty result with basic pagination info
      const limit = Number(restQuery.limit) || 10;
      const page = Number(restQuery.page) || 1;
      return {
        pagination: {
          total: 0,
          limit,
          page,
          totalPage: 0,
        },
        data: [],
      };
    }

    baseFilter = {
      ...baseFilter,
      $and: [
        {
          $or: [
            { requestFrom: { $in: matchedUserIds } },
            { requestTo: { $in: matchedUserIds } },
          ],
        },
      ],
    };
  }

  const qb = new QueryBuilder(NetworkConnection.find(baseFilter), restQuery)
    .paginate()
    // .search is not used here because we are searching via the User collection above
    .fields()
    .filter()
    .sort();
  const rawData = await qb.modelQuery
    .populate('requestFrom', 'name image')
    .populate('requestTo', 'name image')
    .lean();

  const data = rawData
    .map(item => {
      const isRequester = item.requestFrom?._id?.toString() === userId;
      const isReceiver = item.requestTo?._id?.toString() === userId;

      const user = isRequester ? item.requestTo : item.requestFrom;

      let priority = 3;

      if (isReceiver && item.status === NETWORK_CONNECTION_STATUS.PENDING) {
        priority = 1;
      } else if (item.status === NETWORK_CONNECTION_STATUS.ACCEPTED) {
        priority = 2;
      }

      return {
        _id: item._id,
        user,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        priority,
      };
    })
    .filter(
      item =>
        !(
          item.status === NETWORK_CONNECTION_STATUS.PENDING &&
          item.priority === 3
        )
    )
    .sort((a, b) => a.priority - b.priority)
    .map(({ priority, ...rest }) => rest);

  const pagination = await qb.getPaginationInfo();
  return { pagination, data };
};

const getByIdFromDB = async (id: string) => {
  const doc = await NetworkConnection.findById(id)
    .populate('requestFrom', 'name email avatar')
    .populate('requestTo', 'name email avatar');

  if (!doc) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Connection not found');
  }
  return doc;
};

const cancel = async (payload: INetworkConnection) => {
  if (!payload.requestFrom || !payload.requestTo) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Both requestFrom and requestTo are required'
    );
  }

  if (payload.requestFrom.toString() === payload.requestTo.toString()) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You cannot cancel a connection request to yourself'
    );
  }

  // Only remove a pending request created by the current user (requestFrom)
  const existing = await NetworkConnection.findOne({
    requestFrom: payload.requestFrom,
    requestTo: payload.requestTo,
    status: NETWORK_CONNECTION_STATUS.PENDING,
  });

  if (!existing) {
    return { message: 'No pending connection request found to cancel.' };
  }

  // Remove notification associated with this network request (by deleteReferenceId)
  Notification.deleteOne({ deleteReferenceId: existing._id }).exec();
  await NetworkConnection.findByIdAndDelete(existing._id);

  return { message: 'Connection request cancelled .' };
};

const disconnect = async (networkId: string, userId: string) => {
  // Find the connection by id
  const connection = await NetworkConnection.findById(networkId);

  if (!connection) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Connection not found');
  }

  // Check if the user is part of the connection
  if (
    connection.requestFrom.toString() !== userId &&
    connection.requestTo.toString() !== userId
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You do not have permission to disconnect this connection'
    );
  }

  // Prevent users from disconnecting themselves
  if (connection.requestFrom.toString() === connection.requestTo.toString()) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You cannot disconnect from yourself'
    );
  }

  // Only allow disconnecting accepted connections
  if (connection.status !== NETWORK_CONNECTION_STATUS.ACCEPTED) {
    return { message: 'Connection is not currently accepted.' };
  }

  // Remove the accepted connection
  await NetworkConnection.findByIdAndDelete(networkId);

  return { message: 'connection disconnected!' };
};

const getUserAllNetworks = async (
  requestedUserId: string,
  myUserId: string,
  query: Record<string, any> = {}
) => {
  // Only get the *other* users (not self) that requestedUserId is connected to
  // Return the *opposite* user in each network connection (the other party)
  const networkQuery = new QueryBuilder(
    NetworkConnection.find({
      $or: [
        { requestFrom: requestedUserId, requestTo: { $ne: requestedUserId } },
        { requestTo: requestedUserId, requestFrom: { $ne: requestedUserId } },
      ],
      status: NETWORK_CONNECTION_STATUS.ACCEPTED,
    }).populate([
      { path: 'requestFrom', select: 'name image' },
      { path: 'requestTo', select: 'name image' },
    ]),
    query
  )
    .paginate()
    .fields()
    .filter()
    .sort();

  const connections = await networkQuery.modelQuery;
  const pagination = await networkQuery.getPaginationInfo();

  // Map to provide "the other user", and a flag if this 'opposite' user is connected with myUserId
  const data = await Promise.all(
    connections.map(async (conn: any) => {
      // Get the other user in the connection
      let otherUser;
      if (
        conn.requestFrom &&
        conn.requestFrom._id.toString() === requestedUserId
      ) {
        otherUser = conn.requestTo;
      } else {
        otherUser = conn.requestFrom;
      }

      let isConnectedToMe = false;
      if (otherUser && myUserId && otherUser._id.toString() !== myUserId) {
        isConnectedToMe = !!(await NetworkConnection.exists({
          $or: [
            { requestFrom: myUserId, requestTo: otherUser._id },
            { requestFrom: otherUser._id, requestTo: myUserId },
          ],
          status: NETWORK_CONNECTION_STATUS.ACCEPTED,
        }));
      }

      const connObj = conn.toObject ? conn.toObject() : { ...conn };
      delete connObj.requestFrom;
      delete connObj.requestTo;

      return {
        ...connObj,
        user: otherUser,
        isConnectedToMe,
      };
    })
  );

  return {
    pagination,
    data,
  };
};

export const NetworkConnectionService = {
  sendRequestToDB,
  updateStatusInDB,
  deleteFromDB,
  getAllFromDB,
  getByIdFromDB,
  cancel,
  disconnect,
  getUserAllNetworks,
};
