import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { CLUB_ROLE } from '../club/club.constant';
import { Club } from '../club/club.model';
import { ClubMember } from '../club/club_members/club_members.model';
import { Comment } from './comment/comment.model';
import { Like } from './like';
import {
  clubSearchableField,
  CREATOR_TYPE,
  MAX_FEATURES_SKILLS,
  MAX_TAGGED_USERS,
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

  if (payload.post_type === POST_TYPE.PHOTO && !payload.image) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Photo is required');
  }
  if (payload.post_type === POST_TYPE.VIDEO && !payload.media) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Video is required');
  }

  if (payload.creator_type === CREATOR_TYPE.CLUB && !payload.club) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Club id is required');
  }

  if (payload.creator_type === CREATOR_TYPE.CLUB && payload.club) {
    const club = await Club.findById(payload.club).lean();

    // Check if creator is a member of the club
    if (!club) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Club not found.');
    }
    const isCLubMember = await ClubMember.findOne({
      club: club._id,
      user: payload.creator,
      role: CLUB_ROLE.CLUB_MANAGER,
    }).lean();

    if (!isCLubMember) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'You are not a manager/member of this club and cannot create a post.'
      );
    }
  }

  if (
    payload.features_skills &&
    payload.features_skills.length > MAX_FEATURES_SKILLS
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `You can only add up to ${MAX_FEATURES_SKILLS} features skills`
    );
  }

  if (payload.tag_user && payload.tag_user.length > MAX_TAGGED_USERS) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `You can only add up to ${MAX_TAGGED_USERS} tagged users`
    );
  }

  const post = await Post.create(payload);
  return post;
};

//update club post
const updatePost = async (id: string, payload: Partial<IPOST>) => {
  if (payload.creator_type === CREATOR_TYPE.CLUB && !payload.club) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Club id is required');
  }

  if (payload.creator_type === CREATOR_TYPE.CLUB && payload.club) {
    const club = await Club.findById(payload.club).lean();
    const isMember = await ClubMember.findOne({
      club: club?._id,
      user: payload.creator,
      role: CLUB_ROLE.CLUB_MANAGER,
    }).lean();

    if (!isMember) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'You are not a member of this club and cannot update this post.'
      );
    }
  }

  if (
    payload.features_skills &&
    payload.features_skills.length > MAX_FEATURES_SKILLS
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `You can only add up to ${MAX_FEATURES_SKILLS} features skills`
    );
  }

  if (payload.tag_user && payload.tag_user.length > MAX_TAGGED_USERS) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `You can only add up to ${MAX_TAGGED_USERS} tagged users`
    );
  }
  const isEditable = await Post.findById(id, 'createdAt').lean();
  if (!isEditable) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found');
  }
  const createdAt = new Date(isEditable?.createdAt || '').getTime();
  const now = Date.now();
  const thirtyMinutes = 30 * 60 * 1000;
  if (now - createdAt > thirtyMinutes) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You can only edit a post within 30 minutes of creation'
    );
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
  if (
    post?.creator?.toString() !== userId &&
    post.creator_type === CREATOR_TYPE.USER
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You do not have permission to delete this post'
    );
  }

  if (post.creator_type === CREATOR_TYPE.CLUB) {
    const isClubMember = await ClubMember.findOne({
      club: post.club,
      user: userId,
      role: CLUB_ROLE.CLUB_MANAGER,
    }).lean();

    if (!isClubMember) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'You are not a manager/member of this club and cannot delete this post.'
      );
    }
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
      const createdAt = new Date(post.createdAt).getTime();
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000;
      const isEditable = isCreator && now - createdAt <= thirtyMinutes;

      return {
        ...post.toObject(),
        commentOfPost,
        likeOfPost,
        editable: isEditable,
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

const getALlTypeOfpost = async (
  postType: string,
  userId: string,
  query: Record<string, any>
) => {
  let buildQuery: any;
  let searchableField: string[];

  switch (postType) {
    case POST_SERCH_TYPE.PHOTO:
      buildQuery = Post.find({ post_type: POST_TYPE.PHOTO }).populate('creator','profile.image profile.username');
      searchableField = postSearchableField;
      break;
    case POST_SERCH_TYPE.CLUB:
      buildQuery = Club.find().populate('club_creator','profile.image profile.username');
      searchableField = clubSearchableField;
      break;
    case POST_SERCH_TYPE.USER:
      buildQuery = User.find({ _id: { $ne: userId } }).populate('profile.image profile.username');
      searchableField = userSearchableField;
      break;
    case POST_SERCH_TYPE.VIDEO:
      buildQuery = Post.find({ post_type: POST_TYPE.VIDEO }).populate('creator','profile.image profile.username');
      searchableField = postSearchableField;
      break;
    case POST_SERCH_TYPE.SKILL:
      buildQuery = Post.find().populate('creator','profile.image profile.username');
      searchableField = postSearchableField;
      break;
    default:
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Invalid post type. Provide (${POST_SERCH_TYPE.PHOTO} or ${POST_SERCH_TYPE.CLUB} or ${POST_SERCH_TYPE.USER} or ${POST_SERCH_TYPE.VIDEO} or ${POST_SERCH_TYPE.SKILL} ) `
      );
  }

  const postQueryBuilder = new QueryBuilder(buildQuery, query)
    .paginate()
    .search(searchableField)
    .fields()
    .filter()
    .sort();

  let posts = await postQueryBuilder.modelQuery;

  if (postType === POST_SERCH_TYPE.CLUB) {
    posts = await Promise.all(
      posts.map(async (club: any) => {
        const memberCount = await ClubMember.countDocuments({
          club: club._id,
        });
        return { ...club.toObject(), club_members: memberCount };
      })
    );
  }

  if (postType === POST_SERCH_TYPE.USER) {
    posts = await Promise.all(
      posts.map(async (user: any) => {
        const isFollowed = await Follower.findOne({
          follower: userId,
          following: user?._id,
        });
        return { ...user.toObject(), isFollowed: !!isFollowed };
      })
    );
  }

  if (
    postType === POST_SERCH_TYPE.PHOTO ||
    postType === POST_SERCH_TYPE.VIDEO ||
    postType === POST_SERCH_TYPE.SKILL
  ) {
    posts = await Promise.all(
      posts.map(async (post: any) => {

        const [commentOfPost, likeOfPost, isLiked] = await Promise.all([
          Comment.countDocuments({ post: post._id }).lean().exec(),
          Like.countDocuments({ post: post._id }).lean().exec(),
          Like.exists({ user: userId, post: post._id }).lean().exec(),
        ]);

        const isCreator = post?.creator?._id?.toString() === userId;
        const createdAt = new Date(post.createdAt).getTime();
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;
        const isEditable = isCreator && now - createdAt <= thirtyMinutes;
        return {
          ...post.toObject(),
          commentOfPost,
          likeOfPost,
          isCreator: post.creator?._id.toString() === userId,
          hasLiked: !!isLiked,
          editable: isEditable
        };
      })
    );
  }

  const pagination = await postQueryBuilder.getPaginationInfo();

  return {
    pagination,
    data: posts,
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
  getALlTypeOfpost,
  getALlUserLikedPost,
};
