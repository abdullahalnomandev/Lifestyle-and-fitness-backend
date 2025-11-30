import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { IBusinessAndMindsetPlan } from './businessAndMindsetPlan.interface';
import { BusinessAndMindsetPlan } from './businessAndMindsetPlan.model';

const createToDB = async (payload: IBusinessAndMindsetPlan) => {
  const result = await BusinessAndMindsetPlan.create(payload);
  return result;
};

const updateInDB = async (id: string, payload: Partial<IBusinessAndMindsetPlan>) => {
  const updated = await BusinessAndMindsetPlan.findByIdAndUpdate(id, payload, { new: true });
  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Business and Mindset Plan not found');
  }
  return updated;
};

const deleteFromDB = async (id: string) => {
  const deleted = await BusinessAndMindsetPlan.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Business and Mindset Plan not found');
  }
  return deleted;
};

const getAllFromDB = async (query: Record<string, any>) => {
   let queryField =  query;
   queryField = {...query, fields: '-description' , active: true};
  const qb = new QueryBuilder(BusinessAndMindsetPlan.find(), queryField)
    .paginate()
    .search(['title'])
    .fields()
    .filter()
    .sort();
  const data = await qb.modelQuery.lean();
  const pagination = await qb.getPaginationInfo();
  return { pagination, data };
};

const getByIdFromDB = async (id: string) => {
  const doc = await BusinessAndMindsetPlan.findById(id);
  if (!doc) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Business and Mindset Plan not found');
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

