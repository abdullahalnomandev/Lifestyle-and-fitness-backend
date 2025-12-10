export type LineItem = {
  variantId: string;
  quantity: number;
  currencyCode: string;
};

export type CheckoutRequest = {
  lineItems: LineItem[];
};