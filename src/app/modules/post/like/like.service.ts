import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { Like } from './like.model';
import { Notification } from '../../notification/notification.mode';
const createLike = async (postId: string, userId: string, fcmToken: string) => {
  // Create the like
  const like = await Like.create({ post: postId, user: userId });
  await like.populate('post');

  console.log(like)
  // Send notification to post creator if the liker is not the post owner
  const postCreator = (like.post as any)?.creator?.toString?.();
  if (postCreator && postCreator !== userId) {
     Notification.create({
      receiver: postCreator,
      sender: userId,
      title: 'New like on your post',
      message: 'Someone liked your post.',
      refId: postId,
      deleteReferenceId: like._id,
      path: `/user/post/like/${postId}`,
    });
  }

  return like;
};

const deleteLike = async (postId: string, userId: string) => {
  const like = await Like.findOneAndDelete(
    { post: postId, user: userId },
    {
      new: true,
    }
  );


  if (!like) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Like not found');
  }

  Notification.deleteOne({
    deleteReferenceId: like?._id,
    sender: userId,
  }).exec();


  return like;
};

const getLikesByPost = async (
  postId: string,
  query: Record<string, unknown>
) => {
  const likeQuery = new QueryBuilder(
    Like.find({ post: postId }).populate(
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

const hasUserLiked = async (postId: string, userId: string) => {
  return await Like.exists({ post: postId, user: userId }).lean();
};

export const LikeService = {
  createLike,
  deleteLike,
  getLikesByPost,
  hasUserLiked,
};
