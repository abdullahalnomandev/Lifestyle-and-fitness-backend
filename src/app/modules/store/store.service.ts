import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import {
  getAllProducts,
  getAllProductsBySlug,
  getAllProductsCollection,
  getProductByHandle,
  createProductCheckout,
  getProductVariantDetails,
} from './shopify-gql-api/gql-api';
import { User } from '../user/user.model';
import { CheckoutRequest, LineItem } from './store.interface';

const getAllCollection = async (userId: string): Promise<any> => {
  const productCollections = await getAllProductsCollection(20);

  const nodes = productCollections?.collections?.nodes || [];

  // Add "All" item at the top
  const withAll = [
    {
      id: 'all',
      title: 'All',
      handle: 'all',
    },
    ...nodes,
  ];

  return {
    data: withAll,
  };
};

const getProductsByCollectionHnadle = async (
  handle: string,
  userId: string
): Promise<any> => {
  let productCollections = null;

  if (handle === 'all') productCollections = await getAllProducts();
  else productCollections = await getAllProductsBySlug(handle);

  const collection =
    handle === 'all'
      ? productCollections?.products?.edges || []
      : productCollections?.collection?.products?.edges || [];

  const formattedProducts = collection.map((item: any) => {
    const node = item.node;

    const firstImage = node.images?.edges?.[0]?.node?.originalSrc || null;
    const firstVariant = node.variants?.edges?.[0]?.node || {};

    return {
      id: node.id,
      title: node.title,
      handle: node.handle,
      availableForSale: node.availableForSale,
      image: firstImage,

      variantId: firstVariant.id || null,
      variantTitle: firstVariant.title || null,

      price: firstVariant.price?.amount || null,
      currency: firstVariant.price?.currencyCode || null,
    };
  });

  return {
    success: true,
    message: 'Product list retrieved successfully',
    data: formattedProducts,
  };
};

const getProductById = async (handle: string): Promise<any> => {
  const result = await getProductByHandle(handle);

  if (!result?.product) return null;

  const product = result.product;

  // Flatten images
  const images = product.images?.nodes || [];

  // Flatten variants
  const variants = product.variants?.nodes || [];

  return {
    data: {
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      availableForSale: product.availableForSale,
      options: product.options,
      images, // already flattened
      variants, // already flattened
    },
  };
};

// const createCheckoutSession = async (
//   lines: { merchandiseId: string; quantity: number }[]
// ) => {
//   if (lines.length === 0) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Cart is empty');
//   }

//   const result = await createCheckout(lines);

//   console.log({ result });
//   return {
//     data: {
//       id: result?.cartCreate?.cart?.id,
//       checkoutUrl: result?.cartCreate?.cart?.checkoutUrl,
//     },
//   };
// };

const createCheckout = async (
  lineItems: CheckoutRequest,
  userId: string
): Promise<{ data: { id: string; webUrl: string } }> => {

  if (!lineItems || lineItems.lineItems.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Cart is empty');
  }

  const isUserExist = await User.findById(userId);

  // Track total amount (product subtotal + all taxes)
  let totalAmount = 0;

  const cleanLineItems = await Promise.all(
    lineItems.lineItems.map(async ({ variantId, quantity, currencyCode }) => {
      const variantDetails = await getProductVariantDetails(variantId);
      const variantPrice = Number(variantDetails?.productVariant?.price || 0);

      // Simple tax logic: add a tax amount directly to the lineSubtotal (e.g., let's assume a fixed rate 10%)
      const taxRate = 0.06; // Example: 6%
      const lineSubtotal = variantPrice * quantity;
      const taxAmount = lineSubtotal * taxRate;

      // Keep running total (subtotal + tax for each line)
      totalAmount += lineSubtotal + taxAmount;

      return {
        variantId,
        quantity,
        taxLines: [
          {
            title: "State tax",
            rate: taxRate,
            priceSet: {
              shopMoney: {
                // Here amount is the total tax amount of the line total
                amount: taxAmount,
                currencyCode: currencyCode,
              }
            }
          }
        ],
      };
    })
  );

  const data = {
    order: {
      currency: lineItems.lineItems[0].currencyCode || "GBP",
      email: isUserExist?.email,
      poNumber: isUserExist?.shipping_address?.contact_number,
      lineItems: cleanLineItems,
      transactions: [
        {
          kind: "SALE",
          status: "SUCCESS",
          amountSet: {
            shopMoney: {
              amount: totalAmount, // total product price * quantity + tax
              currencyCode: lineItems.lineItems[0].currencyCode || "GBP",
            },
          },
        },
      ],
      shippingAddress: {
        firstName: isUserExist?.name,
        address1: isUserExist?.shipping_address?.address,
        city: isUserExist?.shipping_address?.city,
        country: isUserExist?.shipping_address?.country,
        zip: isUserExist?.shipping_address?.zip,
      },
    },
  };

  console.log('data->',data)
  return {data}

  // const result = await createProductCheckout(data);

  // console.log({ result });

  // return {
  //   data: {
  //     id: result?.id,
  //     webUrl: result?.webUrl,
  //   },
  // };
};

export const StoreService = {
  getAllCollection,
  getProductsByCollectionHnadle,
  getProductById,
//   createCheckoutSession,
  createCheckout,
};
