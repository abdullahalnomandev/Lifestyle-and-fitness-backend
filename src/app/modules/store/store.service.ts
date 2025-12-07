import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { getAllProducts, getAllProductsBySlug, getAllProductsCollection, getProductByHandle,createCheckout } from "./shopify-gql-api/gql-api";

const getAllCollection = async (userId: string): Promise<any> => {
    const productCollections = await getAllProductsCollection(20);

    const nodes = productCollections?.collections?.nodes || [];

    // Add "All" item at the top
    const withAll = [
        {
            id: "all",
            title: "All",
            handle: "all"
        },
        ...nodes
    ];

    return {
        data: withAll
    };
};


const getProductsByCollectionHnadle = async (handle: string, userId: string): Promise<any> => {

    let productCollections = null;

    if (handle === "all") productCollections = await getAllProducts();
    else productCollections = await getAllProductsBySlug(handle);

    const collection = handle === "all" ? productCollections?.products?.edges || [] : productCollections?.collection?.products?.edges || [];

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
            currency: firstVariant.price?.currencyCode || null
        };
    });

    return {
        success: true,
        message: "Product list retrieved successfully",
        data: formattedProducts
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
            images,      // already flattened
            variants     // already flattened
        }
    };
};


const createCheckoutSession = async (lines: {merchandiseId: string; quantity: number}[]) => {

     if(lines.length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Cart is empty');
     }

    const result = await createCheckout(lines);

    console.log({result})
    return {
        data: {
            id: result?.cartCreate?.cart?.id,
            checkoutUrl: result?.cartCreate?.cart?.checkoutUrl
        }
    };
};


export const StoreService = {
    getAllCollection,
    getProductsByCollectionHnadle,
    getProductById,
    createCheckoutSession
};
