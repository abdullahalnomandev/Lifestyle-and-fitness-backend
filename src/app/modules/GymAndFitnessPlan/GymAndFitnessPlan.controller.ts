import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { gymAndFitnessPlanFilterableFields } from './GymAndFitnessPlan.constant';
import { IGymAndFitnessPlan } from './GymAndFitnessPlan.interface';
import { GymAndFitnessPlanService } from './GymAndFitnessPlan.service';

const createGymAndFitnessPlan = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const image = getSingleFilePath(req.files, 'image');
    const data: any = {
      ...req.body
    };

    if (image) {
      data.image = image;
    }

     console.log(data)
    const result = await GymAndFitnessPlanService.createGymAndFitnessPlan(data);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'GymAndFitnessPlan created successfully!',
      data: result,
    });
  }
);

const getAllGymAndFitnessPlans = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, gymAndFitnessPlanFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await GymAndFitnessPlanService.getAllGymAndFitnessPlans(
      filters,
      paginationOptions,
      req.user?.id
    );

    sendResponse<IGymAndFitnessPlan[]>(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'GymAndFitnessPlans fetched successfully !',
      pagination: result.pagination,
      data: result.data,
    });
  }
);

const getSingleGymAndFitnessPlan = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GymAndFitnessPlanService.getSingleGymAndFitnessPlan(
      id,
      req.user?.id
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'GymAndFitnessPlan fetched successfully!',
      data: result,
    });
  }
);

const updateGymAndFitnessPlan = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const image = getSingleFilePath(req.files, 'image');
    const data: any = {
      ...req.body,
    };

    if (image) {
      data.image = image;
    }

    const result = await GymAndFitnessPlanService.updateGymAndFitnessPlan(
      id,
      data
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'GymAndFitnessPlan updated successfully!',
      data: result,
    });
  }
);

const deleteGymAndFitnessPlan = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GymAndFitnessPlanService.deleteGymAndFitnessPlan(id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'GymAndFitnessPlan deleted successfully!',
      data: result,
    });
  }
);

export const GymAndFitnessPlanController = {
  createGymAndFitnessPlan,
  getAllGymAndFitnessPlans,
  getSingleGymAndFitnessPlan,
  updateGymAndFitnessPlan,
  deleteGymAndFitnessPlan,
};
