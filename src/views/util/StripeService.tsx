
import { createHttpClient, STRIPE_API_KEY } from '@stripe/ui-extension-sdk/http_client';
import Stripe from 'stripe';
import { ICoupon, IIncentiveStructure } from '../views/CreateIncentive';

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

export async function delete_stripe_coupon(coupon_id: string) {
  return await stripe.coupons.del(coupon_id);
};

export async function get_promo_codes(coupon_id: string) {
  return await stripe.promotionCodes.list({
    coupon: coupon_id,
  });
};

export async function create_stripe_coupon(coupon_id: string, new_coupon: ICoupon) {
  console.log('create_stripe_coupon', coupon_id, new_coupon)
  let coupon;
  // coupon = await stripe.coupons.create({
  //   id: coupon_id,
  //   percent_off: new_coupon.percent_off ? new_coupon.percent_off : null,
  //   amount_off: new_coupon.amount_off ? new_coupon.amount_off : null,
  //   currency: new_coupon.currency ? new_coupon.currency : null
  // } as any)
  if (new_coupon.amount_off) {
    coupon = await stripe.coupons.create({
      id: coupon_id,
      amount_off: new_coupon.amount_off,
      currency: new_coupon.currency
    } as any );
  } else if (new_coupon.percent_off) {
    coupon = await stripe.coupons.create({
      id: coupon_id,
      percent_off: new_coupon.percent_off
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

export async function deactivate_stripe_promo_code(promo_code_id: string) {
  const promo_code = await stripe.promotionCodes.update(promo_code_id, {
    active: false,
  })
  return promo_code;
};

export async function activate_stripe_promo_code(promo_code_id: string) {
  const promo_code = await stripe.promotionCodes.update(promo_code_id, {
    active: true,
  })
  return promo_code;
};

export async function check_promo_code_exists(code: string) {
  const promo_code = await stripe.promotionCodes.list({
    code: code
  })
  return promo_code;
};
