import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { UserToken } from '../userToken';
import { UserTokenRef } from '../userTokenRef/userTokenRef.model';
import { gymAndFitnessPlanSearchableFields } from './GymAndFitnessPlan.constant';
import { IGymAndFitnessPlan } from './GymAndFitnessPlan.interface';
import { GymAndFitnessPlan } from './GymAndFitnessPlan.model';

const createGymAndFitnessPlan = async (
  payload: IGymAndFitnessPlan
): Promise<IGymAndFitnessPlan | null> => {
  const result = await GymAndFitnessPlan.create(payload);
  return result;
};

const getAllGymAndFitnessPlans = async (
  filters: any,
  query: Record<string, unknown>,
  userId: string
) => {
  const gymAndFitnessPlanQuery = new QueryBuilder(
    GymAndFitnessPlan.find(),
    query
  )
    .search(gymAndFitnessPlanSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await gymAndFitnessPlanQuery.modelQuery.lean();
  const pagination = await gymAndFitnessPlanQuery.getPaginationInfo();

  // Get all item IDs for batch lookup
  const itemIds = result.map(item => item._id);

  const existingRefs = await UserTokenRef.find({
    user: userId,
    ref: { $in: itemIds },
  })
    .select('ref')
    .lean();

  const existingRefIds = new Set(existingRefs.map(ref => ref.ref.toString()));

  // Process data without async operations in map
  const filteredData = result.map(item => ({
    ...item,
    looked: !existingRefIds.has(item._id.toString()),
  }));

  return {
    data: filteredData,
    pagination,
  };
};

const getSingleGymAndFitnessPlan = async (
  id: string,
  userId: string
): Promise<IGymAndFitnessPlan | null> => {
  const [doc, existingRef, totalToken] = await Promise.all([
    GymAndFitnessPlan.findById(id),
    UserTokenRef.exists({ ref: id, user: userId }).lean(),
    UserToken.findOne({ user: userId }),
  ]);

  if (!doc) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'GymAndFitnessPlan not found');
  }
  if ((totalToken?.numberOfToken ?? 0) < 1 && !existingRef) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'You have no token to unlock.');
  }

  if (!existingRef && totalToken && totalToken?.numberOfToken >= 1) {
    await Promise.all([
      UserTokenRef.create({ ref: id, user: userId }),
      UserToken.updateOne({ user: userId }, { $inc: { numberOfToken: -1 } }),
    ]);
  }

  return doc;
};

const updateGymAndFitnessPlan = async (
  id: string,
  payload: Partial<IGymAndFitnessPlan>
): Promise<IGymAndFitnessPlan | null> => {
  const result = await GymAndFitnessPlan.findOneAndUpdate(
    { _id: id },
    payload,
    {
      new: true,
    }
  );
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'GymAndFitnessPlan not found');
  }
  return result;
};

const deleteGymAndFitnessPlan = async (
  id: string
): Promise<IGymAndFitnessPlan | null> => {
  const result = await GymAndFitnessPlan.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'GymAndFitnessPlan not found');
  }
  return result;
};

export const GymAndFitnessPlanService = {
  createGymAndFitnessPlan,
  getAllGymAndFitnessPlans,
  getSingleGymAndFitnessPlan,
  updateGymAndFitnessPlan,
  deleteGymAndFitnessPlan,
};
