import { Request, Response } from 'express';
import Stripe from 'stripe';
import colors from 'colors';
import config from '../../../config';
import { logger } from '../../../shared/logger';
import stripe from '../../../config/stripe';
import { handleConnectedAccount } from './handleConnectedAccount';
import { handlePaymentCheckout } from './handlePaymentCheckout';


const handleStripeWebhook = async (req: Request, res: Response) => {

    // Extract Stripe signature and webhook secret
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = config.stripe.webhook_secret as string;

    let event: Stripe.Event | undefined;

    // Verify the event signature
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (error) {
        logger.warn(`Webhook signature verification failed.`);
    }

    // Check if the event is valid
    if (!event) {
        logger.warn('Webhook signature verification failed');
    }

    // Extract event data and type
    const data = event?.data.object as Stripe.Subscription | Stripe.Account;
    const eventType = event?.type;

    // Handle the event based on its type
    try {
        switch (eventType) {
            case 'account.updated':
                await handleConnectedAccount(data as Stripe.Account);
                break;
            case 'checkout.session.completed':
                await handlePaymentCheckout(event);
                break;

            default:
                logger.warn(colors.bgGreen.bold(`Unhandled event type: ${eventType}`));
        }
    } catch (error) {
        logger.warn(`Error handling event: ${error}`);
    }

    res.sendStatus(200);
};

export default handleStripeWebhook;