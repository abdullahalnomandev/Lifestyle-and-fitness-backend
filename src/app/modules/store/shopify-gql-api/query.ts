
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
      name
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

export const GET_CUSTOMER_ID = `query getCustomerByEmail($email: String!) {
  customers(first: 1, query: $email) {
    edges {
      node {
        id
      }
    }
  }
}
`;

export const GET_CUSTOMER_ORDERS = `query getOrdersByCustomer($query: String!) {
  orders(
    first: 200
    query: $query
    sortKey: CREATED_AT
    reverse: true
  ) {
    edges {
      node {
        id
        name
        poNumber
        createdAt

        displayFinancialStatus
        displayFulfillmentStatus
        closedAt

        totalPriceSet {
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
            product {
              id
              images(first: 1) {
                edges {
                  node {
                    originalSrc
                  }
                }
              }
            }
          }
        }

        tags
        note
      }
    }

    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
`;

export const GET_ORDER_DETAILS = `query getOrderByName($query: String!) {
  orders(first: 1, query: $query) {
    edges {
      node {
        id
        name
        createdAt

        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }

        lineItems(first: 12) {
          nodes {
            id
            title
            quantity

            variant {
              id
              title
              price

              product {
                id
                handle
                images(first: 1) {
                  edges {
                    node {
                      originalSrc
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`;
export const TOTAL_ORDER = `query getTotalOrderCount {
  ordersCount {
    count
  }
}
`;

export const GET_ALL_ORDERS = `query getOrdersByCustomer($first: Int!, $after: String) {
  orders(
    first: $first
    after: $after
    sortKey: CREATED_AT
    reverse: true
  ) {
    edges {
      node {
        id
        name
        poNumber
        createdAt

        displayFinancialStatus
        displayFulfillmentStatus
        closedAt

        totalPriceSet {
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
            product {
              id
              images(first: 1) {
                edges {
                  node {
                    originalSrc
                  }
                }
              }
            }
          }
        }

        tags
        note
      }
    }

    pageInfo {
      hasNextPage
      endCursor
    }
  }
}`;