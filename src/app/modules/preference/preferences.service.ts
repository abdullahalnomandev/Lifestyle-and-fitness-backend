import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { IPreference } from './preferences.interface';
import { Preference } from './preferences.model';

const createToDB = async (payload: IPreference) => {
  const exists = await Preference.findOne({ name: payload.name });
  if (exists) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Interest already exists');
  }
  return await Preference.create(payload);
};

const updateInDB = async (id: string, payload: Partial<IPreference>) => {
  const updated = await Preference.findByIdAndUpdate(id, payload, { new: true });
  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Interest not found');
  }
  return updated;
};

const deleteFromDB = async (id: string) => {
  const deleted = await Preference.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Interest not found');
  }
  return deleted;
};

const getAllFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(Preference.find(), query).paginate().search(['name', 'description']).fields().filter().sort();
  const data = await qb.modelQuery.lean();
  const pagination = await qb.getPaginationInfo();
  return { pagination, data };
};

const getByIdFromDB = async (id: string) => {
  const doc = await Preference.findById(id);
  if (!doc) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Interest not found');
  }
  return doc;
};

export const PreferencesService = {
  createToDB,
  updateInDB,
  deleteFromDB,
  getAllFromDB,
  getByIdFromDB,
};

