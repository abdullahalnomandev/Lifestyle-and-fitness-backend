// const domain = 'roadto1percent.myshopify.com';
// const storefrontAccessToken = 'bec4f2fbc097e060e9cbc5ef72744628'
// const collection = process.env.NEXT_PUBLIC_SHOPIFY_COLLECTION;

// async function callShopify(query) {
//   const fetchUrl = `https://${domain}/api/2024-10/graphql.json`;

//   const fetchOptions = {
//     endpoint: fetchUrl,
//     method: "POST",
//     headers: {
//       "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
//       Accept: "application/json",
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ query }),
//   };

//   try {
//     const data = await fetch(fetchUrl, fetchOptions).then((response) =>
//       response.json()
//     );
//     return data;
//   } catch (error) {
//     throw new Error("Could not fetch products!");
//   }
// }

// export async function getAllProductsInCollection() {
//   const query = `{
//       collectionByHandle(handle: "${collection}") {
//         id
//         title
//         products(first: 250) {
//           edges {
//             node {
//               id
//               title
//               description
//               handle
//               availableForSale
//               images(first: 250) {
//                 edges {
//                   node {
//                     id
//                     originalSrc
//                     height
//                     width
//                     altText
//                   }
//                 }
//               }
//               variants(first: 250) {
//                 edges {
//                   node {
//                     id
//                     title
//                     price {
//                       amount
//                       currencyCode
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }`;

//   const response = await callShopify(query);

//   if (response.data) {
//     return response.data.collectionByHandle.products.edges;
//   } else {
//     throw new Error("Could not fetch products!");
//   }
// }

// export async function getProductSlugs() {
//   const query = `{
//       collectionByHandle(handle: "${collection}") {
//         products(first: 250) {
//           edges {
//             node {
//               handle
//             }
//           }
//         }
//       }
//     }`;
//   const response = await callShopify(query);

//   const slugs = response.data.collectionByHandle.products.edges
//     ? response.data.collectionByHandle.products.edges
//     : [];

//   return slugs;
// }

// export async function getProduct(handle) {
//   const query = `{
//       productByHandle(handle: "${handle}") {
//         id
//         title
//         handle
//         description
//         availableForSale
//         images(first: 250) {
//           edges {
//             node {
//               id
//               originalSrc
//               height
//               width
//               altText
//             }
//           }
//         }
//         variants(first: 250) {
//           edges {
//             node {
//               id
//               title
//               price {
//                 amount
//                 currencyCode
//               }
//               currentlyNotInStock
//             }
//           }
//         }
//       }
//     }`;
//   const response = await callShopify(query);

//   const product = response.data.productByHandle
//     ? response.data.productByHandle
//     : [];

//   return product;
// }

// export async function createCheckout(id, quantity) {
//   const query = `mutation
//       {
//         checkoutCreate(input: {
//           lineItems: [{ variantId: "${id}", quantity: ${quantity} }]
//         }) {
//           checkout {
//              id
//              webUrl
//              lineItems(first: 250) {
//                edges {
//                  node {
//                    id
//                    title
//                    quantity
//                  }
//                }
//              }
//           }
//         }
//       }
//     `;
//   const response = await callShopify(query);

//   const checkout = response?.data?.checkoutCreate?.checkout
//     ? response?.data?.checkoutCreate?.checkout
//     : [];

//   return checkout;
// }

// export async function updateCheckout(id, lineItems) {
//   const formattedLineItems = lineItems.map((item) => {
//     return `{
//       variantId: "${item.variantId}",
//       quantity:${item.quantity}
//     }`;
//   });

//   const query = `mutation
//       {
//         checkoutLineItemsReplace(lineItems: [${formattedLineItems}], checkoutId: "${id}") {
//           checkout {
//              id
//              webUrl
//              lineItems(first: 250) {
//                edges {
//                  node {
//                    id
//                    title
//                    quantity
//                  }
//                }
//              }
//           }
//         }
//       }
//     `;
//   const response = await callShopify(query);

//   const checkout = response?.data?.checkoutLineItemsReplace?.checkout
//     ? response?.data?.checkoutLineItemsReplace?.checkout
//     : [];

//   return checkout;
// }

// // client id : 9834080bccb4a28ee599a65f25838592
// // client secret: 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



// //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  -> my access token
// // 98c0c462b9c95e1fa1da6d381d10fc35    -> my api key
// // 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 -> my api secreat

// // to implement  https://shopify.dev/docs/api/admin-graphql/latest
// // https://shopify.dev/docs/api/admin-rest#endpoints-and-requests
// // https://shopify.dev/docs/api/admin-rest/2025-07/resources/product#get-products-product-id


// /// CREATE RESPONSE
// // {
// //     "product": {
// //         "id": 14839859183983,
// //         "title": "Burton Custom Freestyle 151",
// //         "body_html": "<strong>Good snowboard!</strong>",
// //         "vendor": "Burton",
// //         "product_type": "Snowboard",
// //         "created_at": "2025-12-01T18:54:34+06:00",
// //         "handle": "burton-custom-freestyle-151",
// //         "updated_at": "2025-12-01T18:54:34+06:00",
// //         "published_at": null,
// //         "template_suffix": null,
// //         "published_scope": "web",
// //         "tags": "",
// //         "status": "archived",
// //         "admin_graphql_api_id": "gid://shopify/Product/14839859183983",
// //         "variants": [
// //             {
// //                 "id": 52441763053935,
// //                 "product_id": 14839859183983,
// //                 "title": "Default Title",
// //                 "price": "0.00",
// //                 "position": 1,
// //                 "inventory_policy": "deny",
// //                 "compare_at_price": null,
// //                 "option1": "Default Title",
// //                 "option2": null,
// //                 "option3": null,
// //                 "created_at": "2025-12-01T18:54:34+06:00",
// //                 "updated_at": "2025-12-01T18:54:34+06:00",
// //                 "taxable": true,
// //                 "barcode": null,
// //                 "fulfillment_service": "manual",
// //                 "grams": 0,
// //                 "inventory_management": null,
// //                 "requires_shipping": true,
// //                 "sku": null,
// //                 "weight": 0.0,
// //                 "weight_unit": "kg",
// //                 "inventory_item_id": 53642284761455,
// //                 "inventory_quantity": 0,
// //                 "old_inventory_quantity": 0,
// //                 "admin_graphql_api_id": "gid://shopify/ProductVariant/52441763053935",
// //                 "image_id": null
// //             }
// //         ],
// //         "options": [
// //             {
// //                 "id": 17202961252719,
// //                 "product_id": 14839859183983,
// //                 "name": "Title",
// //                 "position": 1,
// //                 "values": [
// //                     "Default Title"
// //                 ]
// //             }
// //         ],
// //         "images": [],
// //         "image": null
// //     }
// // }