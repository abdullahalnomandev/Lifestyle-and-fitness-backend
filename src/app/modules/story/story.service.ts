import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IStory } from './story.interface';
import { Story } from './story.model';
import dayjs from 'dayjs';
import { IStoryWatch, UserWatchStory } from './userwatchStory/userwatchStory.model';
import { User } from '../user/user.model';
import { NetworkConnection } from '../networkConnetion/networkConnetion.model';
import { NETWORK_CONNECTION_STATUS } from '../networkConnetion/networkConnetion.constant';

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
  // Fetch users with filtering/sorting (no pagination yet)
  const storyQuery = new QueryBuilder(User.find(), query)
    .fields()
    .filter()
    .sort();

  const users = await storyQuery.modelQuery;
  const now = dayjs();
  const oneDayAgo = now.subtract(24, 'hour');
  const userIds = users.map((user: any) => user._id);

  // Find all stories in last 24h (exclude own if provided)
  const storyFilter: any = {
    creator: { $in: userIds },
    createdAt: { $gte: oneDayAgo.toDate(), $lte: now.toDate() }
  };
  if (userId) {
    storyFilter.creator.$ne = userId;
  }

  const recentStories = await Story.find(storyFilter).lean();

  // Group stories by creator
  const storiesByUser: Record<string, any[]> = {};
  recentStories.forEach(story => {
    if (!story.creator) return;
    const creatorId = story.creator.toString();
    if (!storiesByUser[creatorId]) storiesByUser[creatorId] = [];
    storiesByUser[creatorId].push(story);
  });

  // Watch status for user
  const allStoryIds = recentStories.map(story => story._id);
  let watchedStoryIds = new Set<string>();
  if (userId) {
    const watched = await UserWatchStory.find({
      user: userId,
      story: { $in: allStoryIds }
    }).lean();
    watchedStoryIds = new Set(watched.map(s => s.story.toString()));
  }

  // IDs, maps for batch processing
  const creatorIds = users.map((u: any) => u._id.toString());
  let connections: any[] = [];
  let pendingConnections: any[] = [];
  let creators: any[] = [];

  // Parallel batch queries (mimic @post.service.ts)
  if (userId) {
    [
      connections,
      pendingConnections,
      creators
    ] = await Promise.all([
      NetworkConnection.find({
        $or: [
          { requestFrom: userId, requestTo: { $in: creatorIds } },
          { requestFrom: { $in: creatorIds }, requestTo: userId }
        ]
      }).lean(),
      NetworkConnection.find({
        requestFrom: userId,
        requestTo: { $in: creatorIds },
        status: NETWORK_CONNECTION_STATUS.PENDING
      }).lean(),
      User.find({ _id: { $in: creatorIds } })
        .lean()
    ]);
  }

  // Build fast lookup maps for priorities
  // (similar to @post.service.ts for post priorities)
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

  // Build priority logic
  // Priority:
  //   1: NetworkConnection.status === ACCEPTED (bidirectional, as in post.service.ts)
  //   2: profile_mode = public && has at least one story not watched
  // (Those with no stories are skipped)

  const data = users
    .map(user => {
      const uid = user._id.toString();
      const userStories = storiesByUser[uid] || [];
      if (userStories.length === 0) return null; // no stories

      // Find connection status between userId and uid
      let connectionStatus = 'not_requested';
      let priority = 0;
      let showStatus = '';

      if (userId) {
        const key = [uid, userId].sort().join('-');
        connectionStatus = connectionMap.get(key) || 'not_requested';
      }

      // Priority 1: Connected (accepted)
      if (connectionStatus === NETWORK_CONNECTION_STATUS.ACCEPTED) {
        priority = 1;
        showStatus = "accepted";
      } else {
        // Priority 2: profile public, and has unwatched story
        // profile_mode should come from user.profile_mode (not separate map)
        const profileMode = user.profile_mode || "";
        const isPublic = profileMode === "public" || !profileMode;
        if (isPublic) {
          const hasUnwatched = userStories.some(story => !watchedStoryIds.has(story._id.toString()));
          if (hasUnwatched) {
            priority = 2;
            showStatus = "public";
          }
        }
      }

      if (priority === 0) return null;

      return {
        _id: user._id,
        name: user.name,
        image: user.image,
        storyCount: userStories.length,
        priority,
        connectionStatus: showStatus
      };
    })
    .filter(Boolean)
    // Only show priority 1 or 2 (accepted, public with unwatched)
    .filter(u => u!.priority === 1 || u!.priority === 2) as Array<any>;

  // Sort priorities (1 = top)
  data.sort((a, b) => a.priority - b.priority);

  // Pagination after filtering/sorting
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * limit;
  const paginatedData = data.slice(skip, skip + limit);
  const total = data.length;
  const totalPage = Math.ceil(total / limit);
  const paginationInfo = await storyQuery.getPaginationInfo();

  return {
    data: paginatedData,
    pagination: {
      ...paginationInfo,
      total,
      totalPage,
      page,
      limit,
    },
  };
};



const getAllUserStory = async (
  query: Record<string, any>,
  targetId: string,
  userId?: string
) => {
  // Only include stories created in the last 24 hours and hide any with createdAt > now
  const now = dayjs();
  const oneDayAgo = now.subtract(24, 'hour');

  let findQuery: any = {
    creator: targetId,
    createdAt: { $gte: oneDayAgo.toDate(), $lte: now.toDate() }
  };

  // Do not include own stories if userId is provided
  if (userId) {
    findQuery.creator = { $eq: targetId, $ne: userId };
  }

  // Get all stories matching the query (no pagination yet, we'll group by user first)
  const storyQuery = new QueryBuilder(Story.find(findQuery), query)
    .fields()
    .filter()
    .sort();

  const allStories = await storyQuery.modelQuery
    .populate('creator', '_id name image')
    .lean();

  // Prepare an array of storyIds for watch status lookup
  const storyIds = allStories.map((story: any) => story._id);

  // Fetch watch statuses in bulk for the user
  let watchStatuses: Record<string, any> = {};
  if (userId) {
    const watchDocs = await UserWatchStory.find({
      story: { $in: storyIds },
      user: userId
    }).lean();
    watchDocs.forEach((w: any) => {
      watchStatuses[w.story.toString()] = w;
    });
  }

  // Group stories by creator (user)
  const storiesByUser = new Map();

  allStories.forEach((story: any) => {
    const creatorId = story.creator?._id?.toString();
    if (!creatorId) return;

    if (!storiesByUser.has(creatorId)) {
      storiesByUser.set(creatorId, {
        user: {
          _id: story.creator._id,
          name: story.creator.name,
          image: story.creator.image,
        },
        stories: [],
      });
    }

    let isWatchStory = null;
    if (userId) {
      isWatchStory = watchStatuses[story._id.toString()] || null;
    }

    storiesByUser.get(creatorId).stories.push({
      _id: story._id,
      type: story.type,
      caption: story.caption,
      image: story.image,
      media: story.media,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
      isWatchStory : !!isWatchStory,
      isLiked: false
    });
  });

  // Convert map to array
  const groupedData = Array.from(storiesByUser.values());

  // Sort stories within each user group by createdAt (newest first)
  groupedData.forEach((group: any) => {
    group.stories.sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  // Apply pagination to the grouped data
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * limit;
  const total = groupedData.length;
  const paginatedData = groupedData.slice(skip, skip + limit);
  const totalPage = Math.ceil(total / limit);

  return {
    pagination: {
      total,
      limit,
      page,
      totalPage,
    },
    data: paginatedData,
  };
};


const watchStory = async (storyId: string, userId: string | undefined) => {
  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
  }
  let watchHistory = await UserWatchStory.findOne({ story: storyId, user: userId }) as IStoryWatch;

  if (!watchHistory) {
    watchHistory = await UserWatchStory.create({
      user: userId,
      story: storyId
    });
  }

  return {
    data: watchHistory
  };
};




export const StoryService = {
  createStory,
  updateStory,
  deleteStory,
  findById,
  getAllStories,
  getAllUserStory,
  watchStory
};

