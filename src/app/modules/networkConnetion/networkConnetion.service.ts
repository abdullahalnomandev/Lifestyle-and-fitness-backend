import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { INetworkConnection } from './interface';
import { NetworkConnection } from './networkConnetion.model';
import {
  NETWORK_CONNECTION_STATUS,
} from './networkConnetion.constant';

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
    return existing.save();
  }

  return NetworkConnection.create(payload);
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

const getAllFromDB = async (query: Record<string, any>,userId:string) => {
  const qb = new QueryBuilder(
    NetworkConnection.find({
      $and: [
        {
          $or: [
            { requestFrom: userId },
            { requestTo: userId }
          ]
        },
        { status: NETWORK_CONNECTION_STATUS.ACCEPTED }
      ]
    }),
    query
  ) .paginate()
    .search([])
    .fields()
    .filter()
    .sort();

  const data = await qb.modelQuery
    .populate('requestFrom', 'name image')
    .populate('requestTo', 'name image')
    .lean();

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
    status: NETWORK_CONNECTION_STATUS.PENDING
  });

  if (!existing) {
    return { message: 'No pending connection request found to cancel.' };
  }

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
        { requestTo: requestedUserId, requestFrom: { $ne: requestedUserId } }
      ],
      status: NETWORK_CONNECTION_STATUS.ACCEPTED
    })
    .populate([
      { path: 'requestFrom', select: 'name image' },
      { path: 'requestTo', select: 'name image' }
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
      if (conn.requestFrom && conn.requestFrom._id.toString() === requestedUserId) {
        otherUser = conn.requestTo;
      } else {
        otherUser = conn.requestFrom;
      }

      let isConnectedToMe = false;
      if (otherUser && myUserId && otherUser._id.toString() !== myUserId) {
        isConnectedToMe = !!(await NetworkConnection.exists({
          $or: [
            { requestFrom: myUserId, requestTo: otherUser._id },
            { requestFrom: otherUser._id, requestTo: myUserId }
          ],
          status: NETWORK_CONNECTION_STATUS.ACCEPTED
        }));
      }

      const connObj = conn.toObject ? conn.toObject() : { ...conn };
      delete connObj.requestFrom;
      delete connObj.requestTo;

      return {
        ...connObj,
        otherUser,
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
  getUserAllNetworks
};

