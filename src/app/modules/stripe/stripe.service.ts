import Stripe from "stripe";
import config from "../../../config";
import { User } from "../user/user.model";
import { IUser } from "../user/user.interface";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { Club } from "../club/club.model";


const createAccountLink = async (userId: string,clubId:string) => {

    const [user, club] = await Promise.all([
        User.findById(userId),
        Club.findOne({club_creator:userId})
    ]);

    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    if (!club) throw new ApiError(StatusCodes.NOT_FOUND, 'You are not the creator of any club');

    if (user.connected_account_id && user.stripe_connected_link) {
        throw new ApiError(
            StatusCodes.CONFLICT,
            'This user already has a connected Stripe account'
        );
    }

    // Create stripe account link
    let connected_id = user.connected_account_id;
    const stripe = new Stripe(config.stripe.secret_key as string);


    if (!user.connected_account_id) {
        const isUserExist = await User.findById(userId).lean();
        if (!isUserExist) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');

        const account = await stripe.accounts.create({
            email: isUserExist.email as string,
            controller: {
                losses: {
                    payments: 'application'
                },
                fees: {
                    payer: 'application'
                },
                stripe_dashboard: {
                    type: 'express'
                }
            },
            capabilities: {
                card_payments: {
                    requested: true
                },
                transfers: {
                    requested: true
                }
            },
            business_type: 'individual'
        })
        await user.updateOne({ connected_account_id: account.id });
        connected_id = account.id;
    }


    const accountLink = await stripe.accountLinks.create({
        account: connected_id as string,
        refresh_url: `${config.front_end_app_url}/billing?connectedAccountId=${connected_id}` as string,
        return_url: `${config.front_end_app_url}/return/${connected_id}` as string,
        type: "account_onboarding",
    });
    if (!accountLink) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Stripe account link not created');
    }

    return { createAccountLink: accountLink?.url };
};

export const StripeService = {
    createAccountLink
}
