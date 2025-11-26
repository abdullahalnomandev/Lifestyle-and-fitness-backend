import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { PostService } from './post.service';

const createPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let image = getSingleFilePath(req.files, 'image');
    let media = getSingleFilePath(req.files, 'media');

    const data: any = {
      ...req.body,
      creator: user?.id,
    };

    if (image && image !== 'undefined') {
      data.image = image;
    }
    if (media && media !== 'undefined') {
      data.media = media;
    }
    const result = await PostService.createPost(data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Post created successfully',
      data: result,
    });
  }
);

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, any>;
  const userId = req.user?.id;
  // Simple query for all posts, expand with filters as needed
  const { pagination, data } = await PostService.getAllPosts(query, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Posts retrieved successfully',
    pagination,
    data,
  });
});

const getSinglePost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PostService.findById(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post retrieved successfully',
    data: result,
  });
});

const updatePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PostService.updatePost(req.params.id, req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Post updated successfully',
      data: result,
    });
  }
);

const deletePost = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.deletePost(req.user.id, req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post deleted successfully',
    data: result,
  });
});

const getAllMyDrafts = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const drafts = await PostService.getAllMyDrafts(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Draft posts retrieved successfully',
    data: drafts,
  });
});

const getALlTypeOfpost = catchAsync(async (req: Request, res: Response) => {
  const { postType } = req.params;
  const userId = req.user?.id;
  const result = await PostService.getALlTypeOfpost(postType, userId,req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Posts retrieved successfully',
    pagination:result.pagination,
    data: result.data
  });
});


const getALlUserLikedPost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await PostService.getALlUserLikedPost(userId,req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Posts retrieved successfully',
    pagination:result.pagination,
    data: result.data
  });
});



export const PostController = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
  getAllMyDrafts,
  getALlTypeOfpost,
  getALlUserLikedPost
};
