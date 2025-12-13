import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import {
  getAllProducts,
  getAllProductsBySlug,
  getAllProductsCollection,
  getProductByHandle,
  createProductCheckout,
  getProductVariantDetails,
  makeOrderPaid,
  orderDelete,
  getCustomerId,
  getCustomerOrders,
} from './shopify-gql-api/gql-api';
import { User } from '../user/user.model';
import { CheckoutRequest, LineItem } from './store.interface';
import stripe from '../../../config/stripe';
import config from '../../../config';
import { Response } from 'express';
import { UserToken } from '../userToken';

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

const createCheckout = async (
  lineItems: CheckoutRequest,
  userId: string,
  rootUrl: string
): Promise<{ data: { paymentUrl: string } | null }> => {
  if (!lineItems || lineItems.lineItems.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Cart is empty');
  }

  const isUserExist = await User.findById(userId);

  // Track total amount (product subtotal + all taxes), but will sum per line now for Stripe
  let totalAmount = 0;

  // Prepare product "names" and "descriptions" for session-level metadata or summary,
  // plus a joined title representation e.g. "Tshirt (White/XL)"
  let names: string[] = [];
  let descriptions: string[] = [];
  let displayTitles: string[] = [];

  // Prepare cleanLineItems and Stripe line_items in parallel
  const cleanLineItems: any[] = [];
  const stripeLineItems: any[] = [];

  for (const { variantId, quantity, currencyCode } of lineItems.lineItems) {
    const variantDetails = await getProductVariantDetails(variantId);

    const title = variantDetails.productVariant?.title || '';
    const name = variantDetails.productVariant.product?.title || '';
    const description =
      variantDetails.productVariant.product?.description || '';

    // Compose a display title such as "Tshirt (White/XL)"
    let optionStr = '';
    if (
      variantDetails.productVariant?.title &&
      variantDetails.productVariant?.title.toLowerCase() !== 'default title'
    ) {
      optionStr = variantDetails.productVariant?.title;
    }
    let displayTitle = name;
    if (optionStr) {
      displayTitle += ` (${optionStr})`;
    }
    displayTitles.push(displayTitle);

    names.push(name);
    descriptions.push(description);

    const variantPrice = Number(variantDetails?.productVariant?.price || 0);

    // Simple tax logic: add a tax amount directly to the lineSubtotal (e.g., let's assume a fixed rate 6%)
    const taxRate = 0.06; // Example: 6%
    const lineSubtotal = variantPrice * quantity;
    const taxAmount = lineSubtotal * taxRate;

    // Keep running total (subtotal + tax for each line)
    totalAmount += lineSubtotal + taxAmount;

    cleanLineItems.push({
      variantId,
      quantity,
      // You could also add displayTitle here if needed for your own records or db
      title: displayTitle,
      taxLines: [
        {
          title: 'State tax',
          rate: taxRate,
          priceSet: {
            shopMoney: {
              amount: Number(taxAmount.toFixed(1)),
              currencyCode: currencyCode,
            },
          },
        },
      ],
    });

    // This will create a stripe line_items for each variant
    stripeLineItems.push({
      price_data: {
        currency: (currencyCode || 'usd').toLowerCase(),
        product_data: {
          name: displayTitle, // Show e.g. "Tshirt (White/XL)" in Stripe checkout
          description: description,
        },
        unit_amount: Math.round(variantPrice * (1 + taxRate) * 100), // price+tax per item in cents
      },
      quantity: quantity,
    });
  }

  const data = {
    order: {
      currency: lineItems.lineItems[0].currencyCode || 'GBP',
      email: isUserExist?.email,
      poNumber: isUserExist?.shipping_address?.contact_number,
      lineItems: cleanLineItems,
      transactions: [
        {
          kind: 'SALE',
          status: 'PENDING',
          amountSet: {
            shopMoney: {
              amount: Number(totalAmount.toFixed(2)),
              currencyCode: lineItems.lineItems[0].currencyCode || 'GBP',
            },
          },
        },
      ],
      shippingAddress: {
        firstName: isUserExist?.name?.split(' ')?.[0] || '',
        lastName: isUserExist?.name?.split(' ')?.slice(1).join(' ') || '',
        address1: isUserExist?.shipping_address?.address,
        city: isUserExist?.shipping_address?.city,
        country: isUserExist?.shipping_address?.country,
        // countryCode: isUserExist?.shipping_address?.country,
        zip: isUserExist?.shipping_address?.zip,
      },
    },
  };
  const product = await createProductCheckout(data);

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: isUserExist?.email,
    line_items: stripeLineItems,
    metadata: {
      userId: userId,
      productTitles: displayTitles.join(', '),
    },

    success_url: `${rootUrl}/api/v1/store/webhook/${encodeURIComponent(
      product?.orderCreate?.order?.id
    )}?status=success&userId=${userId}`,
    cancel_url: `${rootUrl}/api/v1/store/webhook/${encodeURIComponent(
      product?.orderCreate?.order?.id
    )}?status=cancel&userId=${userId}`,
  });

  return {
    data: {
      paymentUrl: checkoutSession.url ?? '',
    },
  };
};

const updateOrderStatus = async (
  res: Response,
  orderId: string,
  status: 'success' | 'cancel',
  userId: string
) => {
  if (status === 'success') {
    await makeOrderPaid(orderId);

    const userToken = await UserToken.findOne({ user: userId });
    if (!userToken) {
      await UserToken.create({ user: userId, numberOfToken: 1 });
    } else {
      await UserToken.updateOne(
        { user: userId },
        { $inc: { numberOfToken: 1 } }
      );
    }

    res.redirect(
      `${config.front_end_app_url}/success?orderId=${orderId}&userId=${userId}`
    );
  } else {
    if (status === 'cancel') {
      await orderDelete(orderId);

      res.redirect(
        `${config.front_end_app_url}/cancel?orderId=${orderId}&userId=${userId}`
      );
    }
  }
};


const orderHistory = async (userId: string) => {
  // Start response timer
  const startTime = Date.now();

  // Step 1: Respond immediately with "processing" after checking user existence
  const existUser = await User.findById(userId, 'email').lean();

  if (!existUser || !existUser.email) {
    return { 
      data: [],
      message: "No user or user email found" 
    };
  }

  // Optionally: In a real-time or streaming application, you would trigger an event/stream update here
  // E.g., send a WebSocket message or HTTP SSE "processing" status response.
  // (Here, just include in final response for demonstration)
  const firstResponseTime = Date.now() - startTime;

  // Step 2: Fetch Shopify customers by email
  const customerData = await getCustomerId(existUser.email);
  const customerEdges = customerData?.customers?.edges ?? [];

  if (!Array.isArray(customerEdges) || customerEdges.length === 0) {
    return {
      data: [],
      query: customerData,
      message: "No Shopify customer found for this user",
      firstResponseTime
    };
  }

  const customers: Array<{ id: string, node: any }> = customerEdges
    .map(edge => {
      const shopifyGid = edge?.node?.id ?? null;
      return shopifyGid ? { id: shopifyGid.split('/').pop(), node: edge.node } : null;
    })
    .filter((entry): entry is { id: string, node: any } => Boolean(entry && entry.id));

  if (customers.length === 0) {
    return {
      data: [],
      query: customerData,
      message: "No Shopify customer found for this user",
      firstResponseTime
    };
  }

  // Step 3: Fetch Shopify orders in parallel
  const ordersResults = await Promise.all(
    customers.map((shopifyCustomer) => getCustomerOrders(shopifyCustomer.id))
  );

  // Step 4: Flatten all customer orders and add customer node info
  const allItems: any[] = [];
  for (let customerIdx = 0; customerIdx < customers.length; customerIdx++) {
    const ordersResponse = ordersResults[customerIdx];
    const customerNode = customers[customerIdx].node;
    const edges = ordersResponse?.orders?.edges ?? [];
    if (Array.isArray(edges) && edges.length > 0) {
      const items = edges.map((orderEdge: any) => {
        const node = orderEdge.node;
        return {
          orderId: node.id,
          customId: node.id ? node.id.split('/').pop() : null,
          price: node.totalPriceSet?.shopMoney?.amount ?? null,
          currency: node.totalPriceSet?.shopMoney?.currencyCode ?? null,
          totalItems: node?.lineItems?.nodes.length ?? 0,
          // paymentStatus: node.displayFinancialStatus,
          // fulfillStatus: node.displayFulfillmentStatus,
          // poNumber: node.poNumber,
          date: node.createdAt,
          // customer: {
          //   id: customerNode?.id,
          //   ...customerNode
          // }
        };
      });
      allItems.push(...items);
    }
  }

  if (allItems.length === 0) {
    return {
      data: [],
      query: customerData,
      message: "No orders found for this customer",
      firstResponseTime
    };
  }

  // Return full data and measured first response time
  return {
    data: allItems,
    query: customerData,
    total: allItems.length,
    message: "Order history fetched successfully",
    firstResponseTime
  };
};



export const StoreService = {
  getAllCollection,
  getProductsByCollectionHnadle,
  getProductById,
  createCheckout,
  updateOrderStatus,
  orderHistory
};
