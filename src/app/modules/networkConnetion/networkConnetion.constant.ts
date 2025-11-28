
export const NETWORK_CONNECTION_STATUS = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
  } as const;
  
  export const NETWORK_CONNECTION_STATUS_LIST = [
    NETWORK_CONNECTION_STATUS.PENDING,
    NETWORK_CONNECTION_STATUS.ACCEPTED,
    NETWORK_CONNECTION_STATUS.REJECTED,
  ] as const;
  
  export type NetworkConnectionStatus =
    (typeof NETWORK_CONNECTION_STATUS_LIST)[number];
  