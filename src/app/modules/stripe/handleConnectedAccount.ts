import Stripe from 'stripe';
import { logger } from '../../../shared/logger';
import { User } from '../user/user.model';
import stripe from '../../../config/stripe';

export const handleConnectedAccount = async (data: Stripe.Account) => {

    // Find the user by Stripe account ID
    const existingUser = await User.findOne({ email: data.email });

    if (!existingUser) {
        logger.info(`User not found for account ID: ${data.id}`);
    }

    // Check if the onboarding is complete
    if (data.charges_enabled) {
        const loginLink = await stripe.accounts.createLoginLink(data.id);

        // Save Stripe account information to the user record
        await User.findByIdAndUpdate(existingUser?._id, {
            stripe_connected_link: loginLink?.url,
            // accountInformation:{
            //     stripeAccountId: data.id,
            //     accountUrl: loginLink.url,
            // }
        });
        // UPDATE HOTEL STATUS DRAFT TO ACTIVE
    }

    return;
}