import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { Comment } from './comment/comment.model';
import { Like } from './like';
import { POST_TYPE, USER_POST_TYPE } from './post.constant';
import { IPOST } from './post.interface';
import { Post } from './post.model';
import { User } from '../user/user.model';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import { NetworkConnection } from '../networkConnetion/networkConnetion.model';
import { NETWORK_CONNECTION_STATUS } from '../networkConnetion/networkConnetion.constant';
import { Preference } from '../preference/preferences.model';
import { Save } from './save';
import { PROFILE_MODE } from '../user/user.constant';
import { PostView } from './postView/postView.model';

//Create a new club
const createPost = async (payload: IPOST) => {
  const post = await Post.create(payload);
  return post;
};

//update club post
const updatePost = async (id: string, payload: Partial<IPOST>) => {
  const isEditable = await Post.findById(id, 'createdAt').lean();
  if (!isEditable) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found');
  }

  const updatedPost = await Post.findByIdAndUpdate(id, payload, { new: true });
  if (!updatedPost) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found');
  }
  return updatedPost;
};

const getAllMyDrafts = async (userId: string) => {
  const drafts = await Post.find({
    creator: userId,
    post_type: POST_TYPE.DRAFTS,
  }).lean();

  if (!drafts) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No drafts found');
  }

  return drafts;
};

const deletePost = async (userId: string, postId: string) => {
  // Check if the post exists
  const post = await Post.findById(postId).lean();
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found');
  }

  const deletedPost = await Post.findOneAndDelete({
    _id: postId,
    creator: userId,
  });
  if (!deletedPost) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Post not found or you do not have permission to delete this post'
    );
  }

  return deletedPost;
};

const findById = async (postId: string, userId?: string) => {
  const post = await Post.findById(postId).lean();
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found');
  }

  // Get comments count
  const commentOfPost = await Comment.countDocuments({ post: postId }).lean();
  // Get likes count
  const likeOfPost = await Like.countDocuments({ post: postId }).lean();

  // Count of replies (replay) for this post's comments
  const repliesCount = await Comment.countDocuments({ post: postId }).lean();

  // Get isOwner - compare creator with passed userId
  let isOwner = false;
  if (userId && post.creator) {
    isOwner = post.creator.toString() === userId.toString();
  }

  // set fields like getAllPosts
  return {
    ...post,
    commentOfPost,
    likeOfPost,
    repliesCount,
    isOwner,
  };
};

// const getAllPosts = async (query: Record<string, any>, userId: string) => {
//   const userQuery = new QueryBuilder(Post.find(), query)
//     .paginate()
//     .fields()
//     .filter()
//     .sort();

//   const posts = await userQuery.modelQuery;

//   // Load user preferences once
//   const currentUser = await User.findById(userId).populate("preferences").lean();
//   const userPreferenceIds = currentUser?.preferences?.map((p: any) => p._id.toString()) || [];

//   const enriched = await Promise.all(
//     posts.map(async (post: any) => {
//       const creatorId = post.creator.toString();

//       const [comments, likes, connection, requestConnection, hasSave, isLiked] = await Promise.all([
//         Comment.countDocuments({ post: post._id }).lean(),
//         Like.countDocuments({ post: post._id }).lean(),
//         NetworkConnection.findOne({
//           $or: [
//             { requestFrom: userId, requestTo: creatorId },
//             { requestFrom: creatorId, requestTo: userId },
//           ],
//         }).lean(),
//         NetworkConnection.findOne({
//           $or: [{ requestFrom: userId, requestTo: creatorId }],
//         }).lean(),
//         Save.exists({ user: userId, post: post._id }),
//         Like.exists({ user: userId, post: post._id })  // ⭐ Added isLiked
//       ]);

//       const isOwner = creatorId === userId;

//       // ---------- PRIORITY ----------
//       let priority = 4;

//       if (connection?.status === NETWORK_CONNECTION_STATUS.ACCEPTED) {
//         priority = 1;
//       } else if (requestConnection?.status === NETWORK_CONNECTION_STATUS.PENDING) {
//         priority = 2;
//       } else {
//         const creator = await User.findById(creatorId)
//           .populate("preferences")
//           .lean();

//         const creatorPrefIds = creator?.preferences?.map((p: any) => p._id.toString()) || [];
//         const hasPreferenceMatch = creatorPrefIds.some(id => userPreferenceIds.includes(id));

//         if (hasPreferenceMatch) priority = 3;
//       }

//       return {
//         ...post.toObject(),
//         commentOfPost: comments,
//         likeOfPost: likes,
//         isOwner,
//         isLiked: !!isLiked,        // ⭐ Added here
//         hasSave: !!hasSave,
//         priority,
//         connectionStatus: connection?.status || "not_requested",
//       };
//     })
//   );

//   enriched.sort((a, b) => a.priority - b.priority);

//   const pagination = await userQuery.getPaginationInfo();

//   return {
//     data: enriched,
//     pagination,
//   };
// };

const getAllPosts = async (query: Record<string, any>, userId: string) => {
  // Extract pagination params before building query
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * limit;

  // Build query WITHOUT pagination - we need all posts to calculate priority correctly
  const userQuery = new QueryBuilder(Post.find(), query)
    .fields()
    .filter()
    .sort();

  const allPosts = await userQuery.modelQuery
    .lean()
    .populate('creator', '_id name image profile_mode');

  const postIds = allPosts.map((p: any) => p._id);
  const creatorIds = allPosts
    .map((p: any) => p.creator?._id.toString())
    .filter(Boolean);

  // Load user preferences once
  const currentUser = await User.findById(userId)
    .populate('preferences')
    .lean();
  const userPrefIds =
    currentUser?.preferences?.map((p: any) => p._id.toString()) || [];

  // -------------------------------
  // BATCH QUERIES (0 inside loop)
  // -------------------------------
  const [
    commentsByPost,
    likesByPost,
    userLikes,
    savedPosts,
    connections,
    pendingConnections,
    creators,
  ] = await Promise.all([
    Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$post', count: { $sum: 1 } } },
    ]),
    Like.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$post', count: { $sum: 1 } } },
    ]),
    Like.find({ user: userId, post: { $in: postIds } }).lean(),
    Save.find({ user: userId, post: { $in: postIds } }).lean(),
    NetworkConnection.find({
      $or: [
        { requestFrom: userId, requestTo: { $in: creatorIds } },
        { requestFrom: { $in: creatorIds }, requestTo: userId },
      ],
    }).lean(),
    NetworkConnection.find({
      requestFrom: userId,
      requestTo: { $in: creatorIds },
      status: NETWORK_CONNECTION_STATUS.PENDING,
    }).lean(),
    User.find({ _id: { $in: creatorIds } })
      .populate('preferences')
      .lean(),
  ]);

  // Convert to fast lookup maps
  const commentMap = Object.fromEntries(
    commentsByPost.map(c => [c._id.toString(), c.count])
  );
  const likeMap = Object.fromEntries(
    likesByPost.map(l => [l._id.toString(), l.count])
  );
  const likedMap = new Set(userLikes.map(l => l.post.toString()));
  const savedMap = new Set(savedPosts.map(s => s.post.toString()));

  const connectionMap = new Map();
  connections.forEach(c => {
    const key = [c.requestFrom.toString(), c.requestTo.toString()]
      .sort()
      .join('-');
    connectionMap.set(key, c.status);
  });

  const pendingMap = new Set(
    pendingConnections.map(c => c.requestTo.toString())
  );

  const creatorPrefMap = new Map(
    creators.map((c: any) => [
      c._id.toString(),
      c.preferences?.map((p: any) => p._id.toString()) || [],
    ])
  );

  // -------------------------------
  // BUILD RESPONSE (NO DB CALLS)
  // -------------------------------
  const enriched = allPosts
    .map((post: any) => {
      const postId = post._id.toString();
      const creatorId = post.creator?._id?.toString();

      if (!creatorId) {
        return null;
      }

      const key = [creatorId, userId].sort().join('-');
      const connectionStatus = connectionMap.get(key) || 'not_requested';

      let priority = 4;

      if (connectionStatus === NETWORK_CONNECTION_STATUS.ACCEPTED) {
        priority = 1;
      } else if (
        pendingMap.has(creatorId) &&
        post.creator.profile_mode === PROFILE_MODE.PUBLIC
      ) {
        priority = 2;
      } else {
        const creatorPrefs = creatorPrefMap.get(creatorId) || [];
        const hasMatch = creatorPrefs.some((id: string) =>
          userPrefIds.includes(id)
        );
        if (hasMatch && post.creator.profile_mode === PROFILE_MODE.PUBLIC) {
          priority = 3;
        }
      }

      return {
        ...post,
        commentOfPost: commentMap[postId] || 0,
        likeOfPost: likeMap[postId] || 0,
        isOwner: creatorId === userId,
        isLiked: likedMap.has(postId),
        hasSave: savedMap.has(postId),
        priority,
        connectionStatus,
      };
    })
    .filter((post): post is NonNullable<typeof post> => post !== null)
    // Only keep priorities 1, 2, and 3
    .filter(post => post.priority !== 4);

  // Sort by priority (1 = highest, 3 = lowest)
  enriched.sort((a, b) => a.priority - b.priority);

  // Apply pagination AFTER filtering and sorting
  const total = enriched.length;
  const paginatedData = enriched.slice(skip, skip + limit);
  const totalPage = Math.ceil(total / limit);

  return {
    data: paginatedData,
    pagination: {
      total,
      limit,
      page,
      totalPage,
    },
  };
};

dayjs.extend(isToday);
dayjs.extend(isYesterday);

const getALlUserLikedPost = async (
  userId: string,
  query: Record<string, any>
) => {
  const userQuery = new QueryBuilder(Like.find({ user: userId }), query)
    .paginate()
    .fields()
    .filter()
    .sort();

  const result = await userQuery.modelQuery.populate('post');

  const grouped: Record<string, any[]> = {
    today: [],
    yesterday: [],
    two_days_ago: [],
    this_week: [],
    this_month: [],
    this_year: [],
    after_this_year: [],
  };

  result.forEach((like: any) => {
    const createdAt = dayjs(like.createdAt);
    let key: string | null = null;

    if (createdAt.isToday()) key = 'today';
    else if (createdAt.isYesterday()) key = 'yesterday';
    else if (createdAt.isAfter(dayjs().subtract(2, 'day')))
      key = 'two_days_ago';
    else if (createdAt.isAfter(dayjs().subtract(7, 'day'))) key = 'this_week';
    else if (createdAt.isAfter(dayjs().startOf('month'))) key = 'this_month';
    else if (createdAt.isAfter(dayjs().startOf('year'))) key = 'this_year';
    else {
      grouped.after_this_year.push(like);
      return;
    }

    if (key) grouped[key].push(like);
  });

  const pagination = await userQuery.getPaginationInfo();

  return {
    pagination,
    data: grouped,
  };
};

const viewVideo = async (userId: string, videoId: string) => {
  const post = (await Post.findById(videoId)) as IPOST;
  if (post.type !== USER_POST_TYPE.VIDEO) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Video post not found');
  }

  let existingView = await PostView.findOne({ video: videoId, user: userId });
  if (!existingView) {
    existingView = await PostView.create({ video: videoId, user: userId });
  }

  return existingView;
};
export const PostService = {
  createPost,
  getAllMyDrafts,
  updatePost,
  deletePost,
  findById,
  getAllPosts,
  getALlUserLikedPost,
  viewVideo,
};
