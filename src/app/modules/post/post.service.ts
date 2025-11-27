import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { Comment } from './comment/comment.model';
import { Like } from './like';
import {
  clubSearchableField,
  POST_SERCH_TYPE,
  POST_TYPE,
  postSearchableField,
  userSearchableField,
} from './post.constant';
import { IPOST } from './post.interface';
import { Post } from './post.model';
import { User } from '../user/user.model';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import { Follower } from '../user/follower/follower.model';

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

const findById = async (postId: string) => {
  const post = await Post.findById(postId).lean();
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found');
  }
  return post;
};
const getAllPosts = async (query: Record<string, any>, userId: string) => {
  // Build the query with pagination, filtering, sorting, and field selection
  const userQuery = new QueryBuilder(Post.find(), query)
    .paginate()
    .fields()
    .filter()
    .sort();

  // Execute the query to get the posts
  const result = await userQuery.modelQuery;

  // Enrich each post with comment count, like count, and editable status
  const dataWithEditable = await Promise.all(
    result.map(async (post: any) => {
      const [commentOfPost, likeOfPost] = await Promise.all([
        Comment.countDocuments({ post: post._id }).lean(),
        Like.countDocuments({ post: post._id }).lean(),
      ]);

      const isCreator = post.creator.toString() === userId;
      return {
        ...post.toObject(),
        commentOfPost,
        likeOfPost,
        isOwner: isCreator,
      };
    })
  );

  // Get pagination metadata
  const pagination = await userQuery.getPaginationInfo();

  return {
    data: dataWithEditable,
    pagination,
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
export const PostService = {
  createPost,
  getAllMyDrafts,
  updatePost,
  deletePost,
  findById,
  getAllPosts,
  getALlUserLikedPost,
};
