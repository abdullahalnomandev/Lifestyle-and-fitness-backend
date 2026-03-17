import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { Report } from './report.model';
import { Post } from '../post.model';


// CREATE REPORT
const createReport = async (
  postId: string,
  userId: string,
  payload: {
    reason: string;
    description?: string;
  }
) => {

  const isPostExist = await Post.findById(postId);

  if (!isPostExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found');
  }
  // Prevent duplicate report
  const existing = await Report.findOne({
    post: postId,
    reportedBy: userId,
  });

  if (existing) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You have already reported this post'
    );
  }

  const report = await Report.create({
    post: postId,
    reportedBy: userId,
    reason: payload.reason,
    description: payload.description,
  });

  return report;
};


// GET ALL REPORTS (ADMIN)
const getAllReports = async (query: Record<string, unknown>) => {
  const reportQuery = new QueryBuilder(
    Report.find()
      .populate('post')
      .populate('user', 'name image'),
    query
  )
    .paginate()
    .fields()
    .filter()
    .sort();

  const result = await reportQuery.modelQuery;
  const pagination = await reportQuery.getPaginationInfo();

  return {
    data: result,
    pagination,
  };
};


// GET REPORTS BY POST
const getReportsByPost = async (
  postId: string,
  query: Record<string, unknown>
) => {
  const reportQuery = new QueryBuilder(
    Report.find({ post: postId }).populate(
      'user',
      'name image'
    ),
    query
  )
    .paginate()
    .fields()
    .filter()
    .sort();

  const result = await reportQuery.modelQuery;
  const pagination = await reportQuery.getPaginationInfo();

  return {
    data: result,
    pagination,
  };
};


// UPDATE REPORT (Admin action)
const updateReport = async (
  reportId: string,
  payload: {
    status?: 'pending' | 'reviewed' | 'resolved';
  }
) => {
  const report = await Report.findByIdAndUpdate(
    reportId,
    payload,
    { new: true }
  );

  if (!report) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Report not found');
  }

  return report;
};


// DELETE REPORT
const deleteReport = async (reportId: string) => {
  const report = await Report.findByIdAndDelete(reportId);

  if (!report) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Report not found');
  }

  return report;
};


export const ReportService = {
  createReport,
  getAllReports,
  getReportsByPost,
  updateReport,
  deleteReport,
};