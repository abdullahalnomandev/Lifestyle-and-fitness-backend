import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { StoryLike } from './like.model';
import { Story } from '../story.model';
import { Notification } from '../../notification/notification.mode';
import { IStory } from '../story.interface';

const createLike = async (storyId: string, userId: string) => {
  // Create like
  const like = await StoryLike.create({ story: storyId, user: userId });
  await like.populate('story', 'creator');

  // Find post/story creator
  const story = like.story;
  const postCreator = (story as IStory).creator?.toString();

  // Don't notify if user likes own post
  if (postCreator && userId !== postCreator) {
    await Notification.create({
      receiver: postCreator,
      sender: userId,
      title: 'New like on your story',
      message: 'Someone liked your story.',
      refId: storyId,
      deleteReferenceId: like._id,
      path: `/user/post/like/${storyId}`,
    });
  }

  return like;
};

const deleteLike = async (storyId: string, userId: string) => {
  const like = await StoryLike.findOneAndDelete(
    { story: storyId, user: userId },
    {
      new: true,
    }
  );

  if (!like) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Like not found');
  }

  // Delete notification based on deleteReferenceId and user actions
  await Notification.findOneAndDelete({
    refId: storyId,
    sender: userId,
    deleteReferenceId: like._id
  });

  return like;
};

const getLikesByStory = async (
  storyId: string,
  query: Record<string, unknown>
) => {
  const likeQuery = new QueryBuilder(
    StoryLike.find({ story: storyId }).populate(
      'user',
      'name image'
    ),
    query
  )
    .paginate()
    .fields()
    .filter()
    .sort();

  const result = await likeQuery.modelQuery;
  const pagination = await likeQuery.getPaginationInfo();

  return {
    data: result,
    pagination,
  };
};

const hasUserLiked = async (storyId: string, userId: string) => {
  return await StoryLike.exists({ story: storyId, user: userId }).lean();
};

export const StoryLikeService = {
  createLike,
  deleteLike,
  getLikesByStory,
  hasUserLiked,
};

