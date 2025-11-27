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

  // Add isCreator & isLiked fields
  const dataWithStatus = result.map((comment: any) => ({
    ...comment.toObject(),
    isCreator: comment.creator._id.toString() === userId,
    isLiked: likedCommentIds.has(comment._id.toString()),
  }));

  return {
    pagination,
    data: dataWithStatus,
  };
};



const createCommentReply = async (payload: ICommentReply) => {
  const post = await Comment.findById(payload.comment);
  if (!post) {
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

  const comment = await CommentReply.create(payload);
  return comment;
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



const deleteCommentReply = async (id: string,userId:string) => {
  console.log({id,userId})
  const deletedComment = await CommentReply.findOneAndDelete({_id:id,creator:userId});
  if (!deletedComment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Comment not found');
  }
  
  return deletedComment;
};


const toggleCommentLike = async (id: string, userId: string) => {
  console.log({id,userId})
  const comment = await Comment.findById(id);
  if (!comment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Comment not found');
  }

  const existingLike = await CommentLike.findOne({ comment: id, user: userId });

  if (existingLike) {
    await CommentLike.findByIdAndDelete(existingLike._id);
    return {
      message: 'Comment unliked successfully',
      data: null, // no like now
    };
  }

  const newLike = await CommentLike.create({ comment: id, user: userId });

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
