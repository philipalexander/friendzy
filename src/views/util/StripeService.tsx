
import { createHttpClient, STRIPE_API_KEY } from '@stripe/ui-extension-sdk/http_client';
import Stripe from 'stripe';
import { IIncentiveStructure } from '../views/CreateIncentive';

// Create an instance of a Stripe object to access customer information.
// You don't need an API Key here, because the app uses the
// dashboard credentials to make requests.
const stripe: Stripe = new Stripe(STRIPE_API_KEY, {
  httpClient: createHttpClient() as Stripe.HttpClient,
  apiVersion: '2022-11-15',
});

export async function get_customer(customer_id: string) {
  return await stripe.customers.retrieve(customer_id)
}

export async function get_stripe_coupon(coupon_id: string) {
  return await stripe.coupons.retrieve(coupon_id);
};

export async function create_stripe_coupon(coupon_id: string, structure: IIncentiveStructure) {
  let coupon;
  if (structure.incentive_type === "AMOUNT_OFF") {
    coupon = await stripe.coupons.create({
      id: coupon_id,
      amount_off: structure.incentive_amount,
      currency: structure.incentive_currency
    } as any );
  } else if (structure.incentive_type === "PERCENT_OFF") {
    coupon = await stripe.coupons.create({
      id: coupon_id,
      percent_off: structure.incentive_amount
    } as any );
  } else {
    throw "Error Creating Stripe Coupon"
  }

  return coupon;
};

export async function add_stripe_metadata_to_customer(customer_id: string, metadata: any) {
  const updated_customer = await stripe.customers.update(customer_id, {
    metadata: metadata
  });
  return updated_customer;
};

export async function create_stripe_promo_code(coupon_id: string, promo_name: string) {
  const promo_code = await stripe.promotionCodes.create({
    coupon: coupon_id,
    code: promo_name
  })
  return promo_code;
};

export async function check_promo_code_exists(code: string) {
  console.log('check_promo_code_exists')
  const promo_code = await stripe.promotionCodes.list({
    code: code
  })
  console.log("promo_code", promo_code)
  return promo_code;
};
