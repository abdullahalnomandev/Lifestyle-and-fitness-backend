import Stripe from "stripe";
import config from ".";

const stripe = new Stripe(config.stripe.secret_key as string, {
    apiVersion: '2025-10-29.clover',
    typescript: true,
});

export default stripe;