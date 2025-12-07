
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

export const CREATE_CEHECKOUT = `mutation CreateCart($lines: [CartLineInput!]!) {
  cartCreate(input: { lines: $lines }) {
    cart {
      id
      checkoutUrl
      lines(first: 10) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                product {
                  title
                }
              }
            }
          }
        }
      }
    }
  }
}`;
