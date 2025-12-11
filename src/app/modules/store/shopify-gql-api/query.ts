
export const GET_ALL_COLLECTION = `query GetCollection($handle: String!) {
  collection(handle: $handle) {
    products(first: 250) {
      edges {
        node {
          id
          title
          handle
          availableForSale
          images(first: 1) {
            edges {
              node {
                id
                originalSrc
                height
                width
                altText
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
}`;

export const GET_ALL_PRODUCT_COLLECTION = `query PoductCollecttions($first: Int!) {
  collections(first: $first) {
    totalCount
    nodes {
      id
      title
      handle
    }
  }
}`;

export const GET_ALL_PRODUCTS = `query GET_ALL_PRODUCTS {
    products(first: 250) {
      edges {
        node {
          id
          title
          handle
          availableForSale
          images(first: 1) {
            edges {
              node {
                id
                originalSrc
                height
                width
                altText
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
}`;

export const GET_PRODUCT_DETILS_BY_HANDLE = `query GET_PRODUCT_DETAILS($handle:String!) {
  product(handle: $handle) {
    id
    title
    handle
    description(truncateAt: 600)
    availableForSale
    options {
      name
      values
    }
    images(first: 10) {
      nodes {
        id
        url: originalSrc
        altText
        width
        height
      }
    }
    variants(first: 10) {
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
      }
    }
  }
}
`;


export const CREATE_ORDER = `mutation orderCreate(
  $order: OrderCreateOrderInput!
  $options: OrderCreateOptionsInput
) {
  orderCreate(order: $order, options: $options) {
    userErrors {
      field
      message
    }
    order {
      id
      totalTaxSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      lineItems(first: 5) {
        nodes {
          id
          title
          quantity
          variant {
            id
          }
          taxLines {
            title
            rate
            priceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
}
`



export const GET_VARIANT_DETAILS= ` query getVariant($id: ID!) {
  productVariant(id: $id) {
    id
    title
    price
    sku
    barcode
    inventoryQuantity
    product {
      description
      title
    }
  }
}
`
export const MAKE_ORDER_PAID = `mutation OrderMarkAsPaid($input: OrderMarkAsPaidInput!) {
  orderMarkAsPaid(input: $input) {
    order {
      id
      displayFinancialStatus
    }
    userErrors {
      field
      message
    }
  }
}
`;

export const DELETE_ORDER = `mutation OrderDelete($orderId: ID!) {
  orderDelete(orderId: $orderId) {
    deletedId
    userErrors {
      field
      message
      code
    }
  }
}
`