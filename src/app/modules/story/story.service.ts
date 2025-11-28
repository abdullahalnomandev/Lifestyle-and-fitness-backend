import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IStory } from './story.interface';
import { Story } from './story.model';

const createStory = async (payload: IStory) => {
  const story = await Story.create(payload);
  return story;
};

const updateStory = async (id: string, payload: Partial<IStory>) => {
  const existing = await Story.findById(id).lean();
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Story not found');
  }

  const updated = await Story.findByIdAndUpdate(id, payload, { new: true });
  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Story not found');
  }
  return updated;
};

const deleteStory = async (userId: string | undefined, storyId: string) => {
  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
  }
  const deleted = await Story.findOneAndDelete({
    _id: storyId,
    creator: userId,
  });

  if (!deleted) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Story not found or you do not have permission to delete this story'
    );
  }

  return deleted;
};

const findById = async (storyId: string) => {
  const story = await Story.findById(storyId).lean();
  if (!story) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Story not found');
  }
  return story;
};

const getAllStories = async (query: Record<string, any>, userId?: string) => {
  const storyQuery = new QueryBuilder(Story.find(), query)
    .paginate()
    .fields()
    .filter()
    .sort();

  const result = await storyQuery.modelQuery;

  const data = result.map(story => {
    const isOwner =
      userId && story.creator ? story.creator.toString() === userId : false;
    return {
      // @ts-ignore
      ...story.toObject(),
      isOwner,
    };
  });

  const pagination = await storyQuery.getPaginationInfo();

  return {
    data,
    pagination,
  };
};

const getAllUserStory = async (
  query: Record<string, any>,
  targetId: string,
  userId?: string
) => {
  const storyQuery = new QueryBuilder(Story.find({ creator: targetId }), query)
    .paginate()
    .fields()
    .filter()
    .sort();

  const result = await storyQuery.modelQuery;

  const data = result.map(story => {
    const isOwner =
      userId && story.creator ? story.creator.toString() === userId : false;
    return {
      // @ts-ignore
      ...story.toObject(),
      isOwner,
    };
  });

  const pagination = await storyQuery.getPaginationInfo();

  return {
    pagination,
    data,
  };
};

export const StoryService = {
  createStory,
  updateStory,
  deleteStory,
  findById,
  getAllStories,
  getAllUserStory
};

