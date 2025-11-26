import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { Like } from './like.model';
import { User } from '../../user/user.model';
import { Notification } from '../../notification/notification.mode';
import { NOTIFICATION_OPTION } from '../../user/notificaiton_settings/notification_settings.constant';
import { Follower } from '../../user/follower/follower.model';
import { IUserNotificationSettings } from '../../user/notificaiton_settings/notifation_sttings.interface';
import { createNotificationThatYouAreTagged } from '../post.util';
const createLike = async (postId: string, userId: string, fcmToken: string) => {
  const like = await Like.create({ post: postId, user: userId });
  await like.populate('post', 'creator tag_user');

  // NOTIFICATION SECTION
  const creator = (like.post as any).creator;
  const tagUsers = (like.post as any).tag_user;
  const userNotificationSettings = await User.findById(creator, '-_id notification_settings')
    .populate('notification_settings')
    .lean();

  createNotificationThatYouAreTagged({
    sender: userId,
    refId: postId,
    deleteReferenceId: like._id,
    receiver: creator,
    type: 'like',
    taggedUsers: tagUsers
  });

  //NOTIFICATION SECTION END


  return like;
};

const deleteLike = async (postId: string, userId: string) => {
  const like = await Like.findOneAndDelete(
    { post: postId, user: userId },
    {
      new: true,
    }
  );

  console.log({ like: like?._id, userId });

  if (!like) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Like not found');
  }

  Notification.deleteOne({
    deleteReferenceId: like._id,
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
      'profile.username profile.firstName profile.lastName avatar'
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
