import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { Post } from '../post.model';
import { IComment } from './comment.interface';
import { Comment } from './comment.model';
import { Notification } from '../../notification/notification.mode';
import { ICommentReply } from './commentReply/commentReply.interface';
import { CommentReply } from './commentReply/commentReply.modelt';
import { CommentLike } from './commentLike/commentLike.modelt';
import { NotificationCount } from '../../notification/notificationCountModel';

// Create a new comment
const createComment = async (payload: IComment,fcmToken:string) => {
  const post = await Post.findById(payload.post);
  if (!post) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Post id is not valid');
  }
  if (!payload.creator) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Comment creator is required');
  }
  if (!payload.text && !payload.image) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Comment text or image is required'
    );
  }

  const comment = await Comment.create(payload);

  // Send notification to post creator if the commenter is not the post owner
  if (post?.creator && post.creator.toString() !== payload.creator.toString()) {
    // Create notification
    Notification.create({
      receiver: post.creator,
      sender: payload.creator,
      title: 'New comment on your post',
      message: 'You have a new comment on your post.',
      refId: post._id,
      deleteReferenceId: comment._id,
      path: `/user/post/${post._id}`
    });

    // Track notification count for the recipient (post.creator)
    const user = post.creator;
    const existingCount = await NotificationCount.findOne({ user });

    if (existingCount) {
      existingCount.count += 1;
      await existingCount.save();
    } else {
      await NotificationCount.create({ user, count: 1 });
    }
  }

  return comment;
};

// Update a comment by ID
const updateComment = async (
  userId: string,
  commentId: string,
  payload: Partial<IComment>
) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Comment not found');
  }

  if (comment.creator.toString() !== userId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You aren't the owner of this comment"
    );
  }

  const updatedComment = await Comment.findByIdAndUpdate(commentId, payload, {
    new: true,
  });

  if (!updatedComment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Comment not found');
  }
  return updatedComment;
};

// Find a comment by ID
const findById = async (id: string) => {
  const comment = await Comment.findById(id).lean();
  if (!comment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Comment not found');
  }
  return comment;
};

// Delete a comment by ID
const deleteComment = async (id: string,userId:string) => {
  const deletedComment = await Comment.findByIdAndDelete(id);
  if (!deletedComment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Comment not found');
  }
    Notification.deleteOne({ deleteReferenceId: deletedComment._id, sender: userId }).exec();
  
  return deletedComment;
};


const getALlCommentsByPost = async (
  postId: string,
  userId: string,
  query: Record<string, unknown>
) => {
  const userQuery = new QueryBuilder(Comment.find({ post: postId }), query)
    .paginate()
    .fields()
    .filter()
    .sort();

  const result = await userQuery.modelQuery.populate(
    'creator',
    'name image'
  );

  const pagination = await userQuery.getPaginationInfo();

  // Get all comment IDs from result
  const commentIds = result.map((c: any) => c._id);

  // Find all likes by this user on these comments
  const likes = await CommentLike.find({
    user: userId,
    comment: { $in: commentIds },
  }).lean();

  const likedCommentIds = new Set(likes.map((l: any) => l.comment.toString()));

  // Add reply count, isCreator & isLiked fields
  // Prepare a map of commentId => reply count using aggregation for efficiency
  const replies = await CommentReply.aggregate([
    { $match: { comment: { $in: commentIds } } },
    { $group: { _id: '$comment', count: { $sum: 1 } } }
  ]);
  const replyCountMap: { [key: string]: number } = {};
  replies.forEach((r: any) => {
    replyCountMap[r._id.toString()] = r.count;
  });

  const dataWithStatus = result.map((comment: any) => ({
    ...comment.toObject(),
    isCreator: comment.creator._id.toString() === userId,
    isLiked: likedCommentIds.has(comment._id.toString()),
    replyCount: replyCountMap[comment._id.toString()] || 0,
  }));

  return {
    pagination,
    data: dataWithStatus,
  };
};



const createCommentReply = async (payload: ICommentReply) => {
  const postComment = await Comment.findById(payload.comment).populate('creator', '_id');
  if (!postComment) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Comment id is not valid');
  }
  if (!payload.creator) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Comment creator is required');
  }
  if (!payload.text && !payload.image) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Comment text or image is required'
    );
  }

  const commentReply = await CommentReply.create(payload);

  // Send notification if replying to someone else's comment
  const commentOwnerId = postComment.creator?._id?.toString();
  const replyCreatorId = payload.creator.toString();
  if (commentOwnerId && commentOwnerId !== replyCreatorId) {
    Notification.create({
      receiver: commentOwnerId,
      sender: replyCreatorId,
      title: 'New reply to your comment',
      message: 'Someone replied to your comment.',
      refId: payload.comment,
      deleteReferenceId: commentReply._id,
      path: `/user/comment/reply/${payload.comment}`,
    });

    // Track notification count for the recipient (commentOwnerId)
    const user = commentOwnerId;
    NotificationCount.findOne({ user }).then(existingCount => {
      if (existingCount) {
        existingCount.count += 1;
        existingCount.save();
      } else {
        NotificationCount.create({ user, count: 1 });
      }
    });
  }

  return commentReply;
};




const getAllCommentReply = async (commentId: string, userId: string, query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(CommentReply.find({ comment: commentId }), query)
    .paginate()
    // .search(userSearchableField)
    .fields()
    .filter()
    .sort();

  const result = await userQuery.modelQuery.populate('creator', 'name image');

  // Add isCreator field
  const dataWithIsCreator = result.map((reply: any) => ({
    ...reply.toObject(), // convert Mongoose document to plain object
    isCreator: reply.creator._id.toString() === userId,
  }));

  const pagination = await userQuery.getPaginationInfo();

  return {
    pagination,
    data: dataWithIsCreator,
  };
};



const deleteCommentReply = async (id: string, userId: string) => {
  // Find and delete the comment reply only if the user is the creator
  const deletedComment = await CommentReply.findOneAndDelete({ _id: id, creator: userId });
  if (!deletedComment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Comment not found');
  }

  // Also delete any notification associated with this reply (using deleteReferenceId)
  await Notification.deleteOne({ deleteReferenceId: deletedComment._id }).exec();

  return deletedComment;
};


const toggleCommentLike = async (id: string, userId: string) => {
  const comment = await Comment.findById(id);
  if (!comment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Comment not found');
  }

  const existingLike = await CommentLike.findOne({ comment: id, user: userId });

  if (existingLike) {
    // Delete any notification linked by deleteReferenceId to this like
    await Notification.deleteOne({ deleteReferenceId: existingLike._id }).exec();
     CommentLike.findByIdAndDelete(existingLike._id);
    return {
      message: 'Comment unliked successfully',
      data: null, // no like now
    };
  }

  const newLike = await CommentLike.create({ comment: id, user: userId });

  // Create notification to comment owner, but do not notify self-likes
  if (comment.creator.toString() !== userId.toString()) {
    // Create notification for comment like
    Notification.create({
      receiver: comment.creator,
      sender: userId,
      title: 'Your comment was liked',
      message: 'Someone liked your comment.',
      refId: comment._id,
      deleteReferenceId: newLike._id,
      path: `/user/comment/like/${comment._id}`,
    });

    // Track notification count for the recipient (comment.creator)
    const user = comment.creator;
    const existingCount = await NotificationCount.findOne({ user });

    if (existingCount) {
      existingCount.count += 1;
      await existingCount.save();
    } else {
      await NotificationCount.create({ user, count: 1 });
    }
  }

  return {
    message: 'Comment liked successfully',
    data: newLike, // return actual like
  };
};




export const CommentService = {
  createComment,
  updateComment,
  findById,
  deleteComment,
  getALlCommentsByPost,
  createCommentReply,
  getAllCommentReply,
  deleteCommentReply,
  toggleCommentLike
};
