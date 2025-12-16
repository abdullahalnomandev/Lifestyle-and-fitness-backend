import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { UserToken } from '../userToken';
import { UserTokenRef } from '../userTokenRef/userTokenRef.model';
import { IBusinessAndMindsetPlan } from './businessAndMindsetPlan.interface';
import { BusinessAndMindsetPlan } from './businessAndMindsetPlan.model';
import { USER_ROLES } from '../../../enums/user';

const createToDB = async (payload: IBusinessAndMindsetPlan) => {
  const result = await BusinessAndMindsetPlan.create(payload);
  return result;
};

const updateInDB = async (
  id: string,
  payload: Partial<IBusinessAndMindsetPlan>
) => {
  const updated = await BusinessAndMindsetPlan.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!updated) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Business and Mindset Plan not found'
    );
  }
  return updated;
};

const deleteFromDB = async (id: string) => {
  const deleted = await BusinessAndMindsetPlan.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Business and Mindset Plan not found'
    );
  }
  return deleted;
};

const getAllFromDB = async (userId: string, query: Record<string, any>) => {
  let queryField = query;
  queryField = { ...query, fields: '-description -active', active: true };
  const qb = new QueryBuilder(BusinessAndMindsetPlan.find(), queryField)
    .paginate()
    .search(['title'])
    .fields()
    .filter()
    .sort();
  const data = await qb.modelQuery.lean();
  const pagination = await qb.getPaginationInfo();

  // Get all item IDs for batch lookup
  const itemIds = data.map(item => item._id);

  const existingRefs = await UserTokenRef.find({
    user: userId,
    ref: { $in: itemIds },
  })
    .select('ref')
    .lean();

  const existingRefIds = new Set(existingRefs.map(ref => ref.ref.toString()));

  // Process data without async operations in map
  const filteredData = data.map(item => ({
    ...item,
    looked: !existingRefIds.has(item._id.toString()),
  }));

  return { pagination, data: filteredData };
};

const getByIdFromDB = async (id: string, userId: string, role?: string) => {
  const doc = await BusinessAndMindsetPlan.findById(id);

  if (!doc) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Business and Mindset Plan not found'
    );
  }

  // If admin or super admin, skip token logic and just return details
  if (role ===  USER_ROLES.ADMIN || role === USER_ROLES.SUPER_ADMIN) {
    return doc;
  }

  // Otherwise apply token & reference logic
  const [existingRef, totalToken] = await Promise.all([
    UserTokenRef.exists({ ref: id, user: userId }).lean(),
    UserToken.findOne({ user: userId }),
  ]);

  if ((totalToken?.numberOfToken ?? 0) < 1 && !existingRef) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'You have no token to unlock.'
    );
  }

  if (!existingRef && totalToken && totalToken?.numberOfToken >= 1) {
    await Promise.all([
      UserTokenRef.create({ ref: id, user: userId }),
      UserToken.updateOne({ user: userId }, { $inc: { numberOfToken: -1 } }),
    ]);
  }

  return doc;
};

export const BusinessAndMindsetPlanService = {
  createToDB,
  updateInDB,
  deleteFromDB,
  getAllFromDB,
  getByIdFromDB,
};
