import Stripe from "stripe";

export const handlePaymentCheckout = async (data: Stripe.CheckoutSessionCompletedEvent) => {
    try {
        const session = data.data.object as Stripe.Checkout.Session;
       
        
        const metadata = session.metadata as {
            orderId: string;
        };
        const orderId = metadata.orderId;
        const paymentIntentId = session.payment_intent as string;
        
        
        // await OrderService.verifyOrderPayment(orderId, paymentIntentId);

    } catch (error) {
       console.log(error);
        
    }
    
}