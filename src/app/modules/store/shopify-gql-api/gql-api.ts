import axios from "axios";
import config from "../../../../config";
import { CREATE_CEHECKOUT, GET_ALL_COLLECTION, GET_ALL_PRODUCT_COLLECTION, GET_ALL_PRODUCTS, GET_PRODUCT_DETILS_BY_HANDLE } from "./query";

const { domain, storefront_access_token } = config.shopify;
const shopify = axios.create({
  baseURL: `https://${domain}/api/2025-10/graphql.json`,
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": String(storefront_access_token),
  },
});

async function runQuery(query: string, variables?: object) {
  try {
    const response = await shopify.post("", {
      query,
      variables,
    });
    return response?.data?.data;
  } catch (error: any) {
    throw  new Error(error.message);
  }
}

export const getAllProductsBySlug = async (handle: string) => runQuery(GET_ALL_COLLECTION, { handle });
export const getAllProductsCollection = async (limit: number) => runQuery(GET_ALL_PRODUCT_COLLECTION, { first: limit });
export const getAllProducts = async () => runQuery(GET_ALL_PRODUCTS,  {});
export const getProductByHandle = async (handle: string) => runQuery(GET_PRODUCT_DETILS_BY_HANDLE, { handle });
export const createCheckout = async (lines: { merchandiseId: string; quantity: number }[]) => runQuery(CREATE_CEHECKOUT,lines );

