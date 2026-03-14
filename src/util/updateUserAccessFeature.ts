import { User } from '../app/modules/user/user.model';
import { findShopifyCustomer } from '../app/modules/store/shopify-gql-api/gql-api';
import { ObjectId } from 'mongoose';

export const updateUserAccessFeature = async (userId: ObjectId): Promise<boolean> => {
  if (!userId) return false;

  const user = await User.findById(userId);
  if (!user) return false;

  if (!user.canAccessFeature) {
    if (user.email) {
      const { customers } = await findShopifyCustomer(user.email);
      if (customers && customers.edges.length > 0) {
       const userInfo = await User.findByIdAndUpdate(user._id, { canAccessFeature: true }, { new: true });
        return true;
      }
    }
  }
  return false;
};