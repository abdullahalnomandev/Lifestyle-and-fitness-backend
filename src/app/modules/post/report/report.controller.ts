import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { ReportService } from './report.service';


// CREATE REPORT
const createReport = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const userId = req.user?.id;

    const result = await ReportService.createReport(postId, userId, req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Post reported successfully',
      data: result,
    });
  }
);


// GET REPORTS BY POST
const getReportsByPost = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const query = req.query;

  const reports = await ReportService.getReportsByPost(postId, query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post reports retrieved successfully',
    pagination: reports.pagination,
    data: reports.data,
  });
});


// GET ALL REPORTS (ADMIN)
const getAllReports = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const reports = await ReportService.getAllReports(query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Reports retrieved successfully',
    pagination: reports.pagination,
    data: reports.data,
  });
});


// UPDATE REPORT STATUS
const updateReport = catchAsync(async (req: Request, res: Response) => {
  const { reportId } = req.params;

  const result = await ReportService.updateReport(reportId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Report updated successfully',
    data: result,
  });
});


// DELETE REPORT
const deleteReport = catchAsync(async (req: Request, res: Response) => {
  const { reportId } = req.params;

  const result = await ReportService.deleteReport(reportId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Report deleted successfully',
    data: result,
  });
});


export const ReportController = {
  createReport,
  getReportsByPost,
  getAllReports,
  updateReport,
  deleteReport,
};