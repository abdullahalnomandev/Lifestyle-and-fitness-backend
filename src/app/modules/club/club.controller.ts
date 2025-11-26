import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { ClubService } from './club.service';

const createClub = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let image = getSingleFilePath(req.files, 'image');
    let cover_image = getSingleFilePath(req.files, 'cover_image');

    const data: any = {
      ...req.body,
      club_creator: user?.id,
    };

    if (image && image !== 'undefined') {
      data.image = image;
    }
    if (cover_image && cover_image !== 'undefined') {
      data.cover_image = cover_image;
    }

    // if (Array.isArray(data.club_members)) {
    //   data.club_members = data.club_members.map((member: any) => {
    //     try {
    //       if (typeof member === 'string') {
    //         const fixed = member
    //           .replace(/'/g, '"')
    //           .replace(/(\w+):/g, '"$1":');

    //         return JSON.parse(fixed);
    //       }
    //       return member;
    //     } catch (e) {
    //       console.error("Failed to parse club_member:", member, e);
    //       return member;
    //     }
    //   });
    // }

    const result = await ClubService.createClub(data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Club created successfully',
      data: result,
    });
  }
);

const getAllClubs = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, any>;
  const result = await ClubService.getAllClubs(req.user?.id, query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Clubs retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getSingleClub = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const result = await ClubService.getSingleClub(id, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Club retrieved successfully',
    data: result,
  });
});

const updateClub = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let image = getSingleFilePath(req.files, 'image');
    let cover_image = getSingleFilePath(req.files, 'cover_image');

    const data: any = {
      ...req.body,
      club_creator: user?.id,
    };
    const { id } = req.params;

    if (image && image !== 'undefined') {
      data.image = image;
    }
    if (cover_image && cover_image !== 'undefined') {
      data.cover_image = cover_image;
    }

    const result = await ClubService.updateClub(id, user?.id, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Club updated successfully',
      data: result,
    });
  }
);

const deleteClub = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ClubService.deleteClub(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Club deleted successfully',
    data: result,
  });
});

const addMemberToClub = catchAsync(async (req: Request, res: Response) => {
  const { clubId } = req.params;
  const { userId, role } = req.body;
  const result = await ClubService.addMemberToClub(clubId, userId, role);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Member added to club successfully',
    data: result,
  });
});

const removeMemberFromClub = catchAsync(async (req: Request, res: Response) => {
  const { clubId, userId } = req.params;
  const result = await ClubService.removeMemberFromClub(clubId, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Member removed from club successfully',
    data: result,
  });
});

const getClubsByCreator = catchAsync(async (req: Request, res: Response) => {
  const { creatorId } = req.params;
  const result = await ClubService.getClubsByCreator(creatorId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Clubs by creator retrieved successfully',
    data: result,
  });
});

const joinClub = catchAsync(async (req: Request, res: Response) => {
  const { clubId } = req.params;
  const userId = req?.user?.id;

  const result = await ClubService.joinClub(clubId, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Successfully joined the club',
    data: result,
  });
});

const getClubs = catchAsync(async (req: Request, res: Response) => {
  const userId = req?.user?.id;
  const result = await ClubService.getClubs(userId, req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Clubs retrieved successfully',
    data: result,
  });
});

const leaveClub = catchAsync(async (req: Request, res: Response) => {
  const { clubId } = req.params;
  const userId = req?.user?.id;
  const { feedback } = req.body;

  const result = await ClubService.leaveClub(clubId, userId, feedback);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Successfully left the club',
    data: result,
  });
});

const isLastMember = catchAsync(async (req: Request, res: Response) => {
  const { clubId } = req.params;
  const userId = req?.user?.id;

  const result = await ClubService.isLastMember(clubId, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Check if last member successfully',
    data: result,
  });
});

const createCloseClubRequest = catchAsync(async (req: Request, res: Response) => {
  const { clubId } = req.params;
  const userId = req?.user?.id;
  const { marketing_permission, feedback } = req.body;

  const result = await ClubService.createCloseClubRequest(clubId, userId, marketing_permission, feedback);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Close club request created successfully',
    data: result,
  });
});

const getClubCloseStatus = catchAsync(async (req: Request, res: Response) => {
  const { clubId } = req.params;
  const userId = req?.user?.id;

  const result = await ClubService.getClubCloseStatus(clubId, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Close club status retrieved successfully',
    data: result,
  });
});



export const ClubController = {
  createClub,
  getAllClubs,
  getSingleClub,
  updateClub,
  deleteClub,
  addMemberToClub,
  removeMemberFromClub,
  getClubsByCreator,
  joinClub,
  getClubs,
  leaveClub,
  isLastMember,
  createCloseClubRequest,
  getClubCloseStatus
};
