export enum MEMBERS_STATUS {
    ATTEND = 'attend',
    WAIT = 'wait',
    CANCEL = 'cancel',
    INITIAL = 'initial'
}

export enum PAYMENT_STATUS {
    PENDING = 'pending',
    PAID = 'paid',
    PAY_IN_PERSON = 'pay_in_person',
    FAILED = 'failed'
}

export enum PAYMENT_METHOD {
    STRIPE = 'stripe',
    PAYPAL = 'paypal',
    PAY_IN_PERSON = 'pay_in_person'
}