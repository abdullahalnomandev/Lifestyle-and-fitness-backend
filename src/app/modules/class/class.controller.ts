import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { getSingleFilePath } from '../../../shared/getFilePath';
import { ClassService } from './class.service';

const createClass = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const result = await ClassService.createClass({...req.body,creator:userId});

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Class created successfully',
            data: result,
        });
    }
);


const getClassesByClubId = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const clubId = req.params.club_id;
        const userId = req.user?.id;
        const query = req.query;
        const result = await ClassService.getClassesByClubId(clubId,userId,query);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Classes retrieved successfully',
            data: result,
        });
    }
);


const getClassSchedule = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const  {class_start_date,class_id} = req.params
        const result = await ClassService.getClassSchedule(req?.user?.id,class_id,class_start_date); 

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Class schedule retrieved successfully',
            data: result,
        })
    }
)


const deleteClass = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const user = req?.user?.id
        const result = await ClassService.deleteClass(user,id);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Class deleted successfully',
            data: result,
        });
    }
);


const updateClass = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const {class_id, club_id} = req.params;
        const result = await ClassService.updateClass({...req.body,creator:userId});

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Class updated successfully',
            data: result,
        });
    }
);

const updateStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const result = await ClassService.updateStatus({...req.body,creator:userId});

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Class status updated successfully',
            data: result,
        });
    }
);




export const ClassController = {
    createClass,
    getClassesByClubId,
    getClassSchedule,
    deleteClass,
    updateClass,
    updateStatus
};
