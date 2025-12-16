
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StoreService } from './store.service';


const getProductCollections = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const result = await  StoreService.getAllCollection(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product collection list retrieved successfully',
    data: result.data,
  });
});

const getProductsByCollectionHandle = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const result = await  StoreService.getProductsByCollectionHnadle(req.params?.slug, userId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product list retrieved successfully',
    data: result.data,
  });
});


const getProductById = catchAsync(async (req: Request, res: Response) => {
  const result = await  StoreService.getProductById(req.params?.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product retrieved successfully',
    data: result.data,
  });
});


// const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
//   const result = await  StoreService.createCheckoutSession(req.body);
//   sendResponse(res, {
//     success: true,
//     statusCode: StatusCodes.OK,
//     message: 'Checkout session created successfully',
//     data: result.data,
//   });
// });


const createCheckout = catchAsync(async (req: Request, res: Response) => {
  const origin = `${req.protocol}://${req.get('host')}`;
  const result = await StoreService.createCheckout(req.body,req.user?.id as string,origin);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Checkout created successfully',
    data: result.data,
  });
});


const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const status = req.query?.status as 'success' | 'cancel';
  const userId = req.query?.userId as string;
  await StoreService.updateOrderStatus(res, id, status, userId);
});


const orderHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreService.orderHistory(req.user?.id as string);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Order history fetched successfully',
    data: result.data,
  });
});


const orderDetails = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const result = await StoreService.orderDetails(orderId, req.user?.id as string);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Order details fetched successfully',
    data: result.data,
  });
});


const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreService.getAllOrders(req?.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Order fetched successfully',
    //@ts-ignore
    pagination:result.pagination,
    data: result.data,
  });
});



export const StoreController = {
  getProductCollections,
  getProductsByCollectionHandle,
  getProductById,
  createCheckout,
  updateOrderStatus,
  orderHistory,
  orderDetails,
  getAllOrders
};
