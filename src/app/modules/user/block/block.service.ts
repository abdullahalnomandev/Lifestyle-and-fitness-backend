import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { UserBlock } from './block.model';

// CREATE BLOCK
const createBlock = async (
  blockerId: string,
  blockedId: string,
  payload?: { reason?: string }
) => {
  if (blockerId === blockedId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "You cannot block yourself");
  }

  // Prevent duplicate block
  const existing = await UserBlock.findOne({ blocker: blockerId, blocked: blockedId });
  if (existing) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "You have already blocked this user");
  }

  const block = await UserBlock.create({
    blocker: blockerId,
    blocked: blockedId,
    reason: payload?.reason,
  });

  return block;
};

// GET ALL BLOCKS (Admin)
const getAllBlocks = async (query: Record<string, unknown> , userId?: string) => {
  const blockQuery = new QueryBuilder(
    UserBlock.find({blocker: userId}).populate('blocker', 'name email').populate('blocked', 'name email'),
    query
  )
    .paginate()
    .fields()
    .filter()
    .sort();

  const result = await blockQuery.modelQuery;
  const pagination = await blockQuery.getPaginationInfo();

  return { data: result, pagination };
};

// GET BLOCKS BY USER
const getBlocksByUser = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const blockQuery = new QueryBuilder(
    UserBlock.find({ blocker: userId }).populate('blocked', 'name email'),
    query
  )
    .paginate()
    .fields()
    .filter()
    .sort();

  const result = await blockQuery.modelQuery;
  const pagination = await blockQuery.getPaginationInfo();

  return { data: result, pagination };
};

// DELETE BLOCK
const deleteBlock = async (blockId: string) => {
  const block = await UserBlock.findByIdAndDelete(blockId);

  if (!block) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Block not found");
  }

  return block;
};

export const BlockService = {
  createBlock,
  getAllBlocks,
  getBlocksByUser,
  deleteBlock,
};