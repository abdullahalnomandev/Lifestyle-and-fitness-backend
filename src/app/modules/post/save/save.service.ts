import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { Save } from './save.model';

const createSave = async (postId: string, userId: string) => {
  const save = await Save.create({ post: postId, user: userId });
  await save.populate('post', 'creator tag_user');
  return save;
};

const deleteSave = async (postId: string, userId: string) => {
  const save = await Save.findOneAndDelete(
    { post: postId, user: userId },
    { new: true }
  );

  if (!save) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Save not found');
  }

  return save;
};

const getSavesByPost = async (
  postId: string,
  query: Record<string, unknown>
) => {
  const saveQuery = new QueryBuilder(
    Save.find({ post: postId }).populate('user', 'name image'),
    query
  )
    .paginate()
    .fields()
    .filter()
    .sort();

  const data = await saveQuery.modelQuery;
  const pagination = await saveQuery.getPaginationInfo();

  return { data, pagination };
};

const hasUserSaved = async (postId: string, userId: string) => {
  return Save.exists({ post: postId, user: userId }).lean();
};

export const SaveService = {
  createSave,
  deleteSave,
  getSavesByPost,
  hasUserSaved,
};

