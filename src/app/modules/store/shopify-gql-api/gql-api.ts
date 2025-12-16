import axios, { AxiosInstance } from 'axios';
import config from '../../../../config';
import {
  CREATE_ORDER,
  DELETE_ORDER,
  GET_ALL_COLLECTION,
  GET_ALL_ORDERS,
  GET_ALL_PRODUCT_COLLECTION,
  GET_ALL_PRODUCTS,
  GET_CUSTOMER_ID,
  GET_CUSTOMER_ORDERS,
  GET_ORDER_DETAILS,
  GET_PRODUCT_DETILS_BY_HANDLE,
  GET_VARIANT_DETAILS,
  MAKE_ORDER_PAID,
  TOTAL_ORDER,
} from './query';

function createShopifyClient(type: 'storefront' | 'admin'): AxiosInstance {
  const { domain, storefront_access_token, admin_access_token } =
    config.shopify;
  const isStorefront = type === 'storefront';
  return axios.create({
    baseURL: `https://${domain}/${
      isStorefront ? 'api' : 'admin/api'
    }/2025-10/graphql.json`,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': String(
        isStorefront ? storefront_access_token : admin_access_token
      ),
    },
  });
}

async function runShopifyQuery(
  client: AxiosInstance,
  query: string,
  variables?: object
): Promise<any> {
  try {
    const response = await client.post('', { query, variables });
    return response?.data?.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Instances
const storefrontClient = createShopifyClient('storefront');
const adminClient = createShopifyClient('admin');

// Storefront Queries
export const getAllProductsBySlug = async (handle: string) => runShopifyQuery(storefrontClient, GET_ALL_COLLECTION, { handle });
export const getAllProductsCollection = async (limit: number) => runShopifyQuery(storefrontClient, GET_ALL_PRODUCT_COLLECTION, { first: limit,});
export const getAllProducts = async () => runShopifyQuery(storefrontClient, GET_ALL_PRODUCTS);
export const getProductByHandle = async (handle: string) => runShopifyQuery(storefrontClient, GET_PRODUCT_DETILS_BY_HANDLE, { handle });

//ADMIN QUERIES
export const createProductCheckout = async (order: any) => runShopifyQuery(adminClient, CREATE_ORDER, order);
export const getProductVariantDetails = async (id: string) => runShopifyQuery(adminClient, GET_VARIANT_DETAILS, { id });
export const makeOrderPaid = async (id: string) => runShopifyQuery(adminClient, MAKE_ORDER_PAID, { input: { id } });
export const orderDelete = async (orderId: string) => runShopifyQuery(adminClient, DELETE_ORDER, {orderId});
export const getCustomerId = async (email: string) => runShopifyQuery(adminClient, GET_CUSTOMER_ID, { email });
export const getCustomerOrders = async (customerId: string) => runShopifyQuery(adminClient, GET_CUSTOMER_ORDERS, { query: `customer_id:${customerId} financial_status:paid`});
export const getOrderDetails = async (id: string) =>  runShopifyQuery(adminClient, GET_ORDER_DETAILS, { query: `name:${id}`});
export const getTotalOrder = async () =>  runShopifyQuery(adminClient, TOTAL_ORDER, {});
export const getAllAdminOrder = async ($first: number, $after?: string) => runShopifyQuery(adminClient, GET_ALL_ORDERS, { first: $first, after: $after });

