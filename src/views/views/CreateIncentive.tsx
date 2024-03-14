// TODO:
// [] input validation
// [] Save state message
// [] Exit state message
// [] Handle updating a coupon by adding a new promo code
// 

import {Box, Button, FormFieldGroup,  Radio, Select,  TextField, FocusView, ButtonGroup, Icon, Inline, Banner } from "@stripe/ui-extension-sdk/ui";
import { useCallback, useEffect, useReducer, useState } from "react";
import { add_stripe_metadata_to_customer, check_promo_code_exists, create_stripe_coupon, create_stripe_promo_code, deactivate_stripe_promo_code, delete_stripe_coupon, get_stripe_coupon } from "../util/StripeService";
import ErrorComponent, { ErrorProps } from "../components/error";
import { process_error } from "../util/error_service";
import { showToast } from "@stripe/ui-extension-sdk/utils";
import CreateEditPromoCode from "../components/promo_code";
import Stripe from 'stripe';
import CreateEditReward from "../components/reward_incentive";
import CreateEditCoupon from "../components/coupon";


type CreateIncentiveProps = {
  // incentive: IIncentiveMetadata;
  onSave: () => void;
  onBack: () => void;
  current_coupon: Stripe.Coupon | null | undefined;
  current_promo_codes: Stripe.PromotionCode[] | null | undefined;
  userContext: any;
  customer: any;
  current_reward: IReward | null | undefined;
};

export interface IReward {
  reward_amount: string;
  reward_currency: string;
  customer_id?: string;
}

export interface ICoupon {
  id: string | undefined;
  amount_off: number | null | undefined;
  percent_off: number | null | undefined;
  currency: string | null | undefined;
}

export interface IPromo {
  code: string;
  id?: string;
  coupon_id?: string;
}

export interface IIncentive {
  reward: IReward | null | undefined;
  coupon: ICoupon | null | undefined;
  promo_codes: Stripe.PromotionCode[] | null | undefined;
}

export interface IIncentiveMetadata {
  raf_incentive_type: string;
  raf_reward_amount: string;
  raf_reward_currency: string;
  raf_incentive_amount: string;
  raf_incentive_currency: string;
  raf_promo_code: string;
}

export interface IIncentiveStructure {
  incentive_type: string;
  reward_amount: string;
  reward_currency: string;
  incentive_amount: string;
  incentive_currency: string;
  promo_code: string;
}

const confirm_close_messages = {
  title: "Your changes will not be saved",
  description: "Are you sure you want to exit?",
  cancelAction: "Cancel",
  exitAction: "Exit",
};

const CreateIncentive = ({ onSave, onBack, userContext, customer, current_coupon, current_promo_codes, current_reward}: CreateIncentiveProps) => {
  // Dev mode only
  // Get Current Coupon and Promo code
  // console.log('userContext', userContext)
  // console.log('customer', customer)
  // console.log('coupon', current_coupon)
  // console.log('promo_codes', current_promo_codes)
  // console.log('reward', current_reward)

  const existing_incentive: IIncentive = {
    reward: current_reward ? current_reward : null,
    coupon: current_coupon ? { id: current_coupon?.id, amount_off: current_coupon?.amount_off, percent_off: current_coupon?.percent_off, currency: current_coupon?.currency} : null,
    promo_codes: current_promo_codes ? current_promo_codes : null
  }
  // const friendzy_incentive_type = coupon && coupon.percent_off ? 'PERCENT_OFF' : 'AMOUNT_OFF'
  // const friendzy_amount_off = coupon && coupon.percent_off ? coupon.percent_off : null
  
  // const [incentive_type, set_incentive_type] = useState(friendzy_incentive_type);


  const [reward, set_reward] = useState<IReward | null | undefined>(existing_incentive.reward);
  const [promo_code, set_promo_code] = useState<IPromo | null | undefined>(existing_incentive.promo_codes ? existing_incentive.promo_codes[0] : null);
  const [coupon, set_coupon] = useState<ICoupon | null | undefined>(existing_incentive.coupon);

  // const [incentive_amount, set_incentive_amount] = useState(friendzy_amount_off ? friendzy_amount_off : '');
  // const [incentive_currency, set_incentive_currency] = useState(coupon ? coupon.currency : '');
  // const [reward_currency, set_reward_currency] = useState(reward ? reward.reward_currency : '');
  
  const [step, update_step] = useState<number>(1)
  const [error, set_error] = useState<ErrorProps | null>(null);
  const [show_focus, set_show_focus] = useState(true);
  
  

  function update_step_handler(current_step: number, destination_step: number) {
    // if (current_step === 1 && promo_invalid) {
    //   showToast("This promotion code is invalid", {type: "caution"})
    //   return;
    // }
    // if (current_step === 1 && promo_code ===)
    if (destination_step < 1) {
      set_show_focus(false)
      onBack();
    } else if (step > 3) {
      showToast("There is no step 4", {type: "caution"})
    }
    update_step(destination_step)
  }

  async function save_incentive_structure(existing_incentive: IIncentive, reward: IReward, promo_code: IPromo, coupon: ICoupon, customer_id: string) {
    try {
      let verified_coupon;
      const existing_promo_code: Stripe.PromotionCode | null = existing_incentive?.promo_codes ? existing_incentive?.promo_codes[0] : null;
      // First, does the coupon need to be updated or created?
      if (existing_incentive.coupon) {
        console.log("existing_incentive.coupon", existing_incentive.coupon)
        // Did the user make any changes to the coupon?
        if (JSON.stringify(existing_incentive.coupon) === JSON.stringify(coupon)) {
          console.log("coupons match")
          // Coupons match so no update to the coupon is needed
          // Check to see if the promo_code needs and update
          if (existing_promo_code?.code !== promo_code?.code) {
            console.log("promos don't match")
            // Promo codes don't match so we'll need to deactivate the first and add the second
            if (existing_promo_code && existing_promo_code.id) {
              console.log("we have an old promo to deactivate")
              const deactivated_code = await deactivate_stripe_promo_code(existing_promo_code.id)
            };
            const new_promo_code = await create_stripe_promo_code(customer_id, promo_code?.code)
          }
        } else { // There are some changes to save. So delete and recreate
          console.log("coupon don't match")
          if (existing_incentive && existing_incentive.coupon && existing_incentive.coupon.id === customer_id) {
            const deleted = await delete_stripe_coupon(existing_incentive.coupon.id)
            verified_coupon = await create_stripe_coupon(customer_id, coupon)
            console.log("coupon was deleted and the new one added", verified_coupon)
            // Now that we have a new coupon, we need to deactivate the old promo and add the new promo (even if the code has remained the same)
            if (existing_promo_code && existing_promo_code.id) {
              const deactivated_code = await deactivate_stripe_promo_code(existing_promo_code.id)
            };
            const new_promo_code = await create_stripe_promo_code(customer_id, promo_code?.code)
          }
          
        }
      } else { // If no coupon exists with this customer ID, create it
        console.log("no coupon existed so we can save a new coupon and a new promo")
        verified_coupon = await create_stripe_coupon(customer_id, coupon)
        const new_promo_code = await create_stripe_promo_code(customer_id, promo_code?.code)
      }
      
      const metadata = {
        raf_promo_code: promo_code?.code,
        raf_reward_amount: reward.reward_amount,
        raf_reward_currency: reward.reward_currency
      }
      const updated_customer = await add_stripe_metadata_to_customer(customer_id, metadata)
      showToast("Customer Updated!", {type: "success"})
      onSave();
    } catch (err) {
      set_error(process_error(err))
      showToast("Coupon could not be updated", {type: "caution"})
    }
  }

  function save_promo_code_handler(new_promo: string) {
    set_promo_code({code: new_promo})
    update_step_handler(step, 2)
    showToast("Promo code set!", {type: "success"})
  }

  function save_reward_handler(new_reward: IReward) {
    set_reward(new_reward)
    // set_reward_currency(new_reward.reward_currency)
    // set_reward_amount(new_reward.reward_amount)
    update_step_handler(step, 3)
    showToast("Reward set!", {type: "success"})
  }

  function save_coupon_handler(new_coupon: ICoupon) {
    set_coupon(new_coupon)
    if (reward && promo_code && new_coupon) {
      save_incentive_structure(existing_incentive, reward, promo_code, new_coupon, customer.id)
    } else (showToast("Missing section!", {type: "caution"}))
    
    showToast("Incentive created", {type: "success"})
  }

  return (
    <FocusView 
      title="Create reward incentive" 
      confirmCloseMessages={confirm_close_messages}
      shown={show_focus}
      setShown={(shown: boolean)=>{set_show_focus(false), onBack()}}
      >
      <Inline css={{font: 'subheading'}}>Step {step} of 3</Inline>
      { error ? <ErrorComponent error_title={error?.error_title} error_message={error?.error_message} type={error?.type}></ErrorComponent> : null }
      
      {step === 1 ? 
      <>
        <CreateEditPromoCode existing_promo_codes={existing_incentive.promo_codes} on_next={(new_promo) => save_promo_code_handler(new_promo) }></CreateEditPromoCode>
      </>
      : null }

      {step === 2 ?   
      <>
        <CreateEditReward existing_reward={reward} customer_currency={customer.currency} on_next={(new_reward: IReward) => save_reward_handler(new_reward)} on_back={() => update_step_handler(step, 1)}></CreateEditReward>
      </>
      : null }

      {step === 3 ? 
        <>

        <CreateEditCoupon existing_coupon={existing_incentive.coupon} customer_currency={customer.currency} on_next={(new_coupon: ICoupon) => save_coupon_handler(new_coupon)} on_back={() => update_step_handler(step, 2)}></CreateEditCoupon>
        {/* <Box css={{
            font: 'body',
            fontWeight: 'semibold',
            color: 'primary',
            marginY: 'medium',
          }}
        >
          Will the referred friend's discount be a percentage or dollar amount?
          <FormFieldGroup>
            <Radio
              name="group"
              label="Amount Off"
              defaultChecked={incentive_type === "AMOUNT_OFF"}
              onChange={(e) => {set_incentive_type("AMOUNT_OFF")}}
            />
            <Radio
              name="group"
              label="Percent Off"
              defaultChecked={incentive_type === "PERCENT_OFF"}
              onChange={(e) => { set_incentive_type("PERCENT_OFF")}}
            />
          </FormFieldGroup>  
        </Box>
            
            {incentive_type === "AMOUNT_OFF" ? (
              <Box css={{ stack: 'x', gap: 'medium', marginY: 'medium' }}> 

                  <TextField 
                  label="Amount Discount" 
                  description="Must be a number" 
                  type="number" 
                  placeholder="Discount Amount" 
                  css={{width: '1/3' }} 
                  defaultValue={incentive_amount}
                  required={true}
                  onChange={(e)=>set_incentive_amount(e.target.value)}/>

                <Select
                  name="demo-001"
                  label="Currency"
                  description="Choose from list" 
                  // defaultValue={incentive_currency}
                  css={{width: '1/4'}}
                  required={true}
                  onChange={(e) => {
                    console.log(e);
                    set_incentive_currency(e.target.value)
                  }}
                >
                  <option value="">Choose an option</option>
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                </Select>
              </Box>
            )  : null}
        
            {incentive_type === "PERCENT_OFF" ? (
              <Box>
                <Box css={{marginY: 'medium'}} >
                  <TextField 
                  label="Percent Discount" 
                  description="Must be a whole number" 
                  type="number" 
                  defaultValue={incentive_amount}
                  required={true}
                  placeholder="Discount Percentage" 
                  css={{width: 'fill'}} 
                  onChange={(e)=>set_incentive_amount(e.target.value)}/>
                </Box>
              </Box>
            )  : null}

            <Box css={{
              background: "container",
              borderRadius: "medium",
              marginY: "medium",
              padding: "large",
            }}>
              <Inline css={{font: 'body', color: 'primary', fontWeight: 'semibold'}}>Example: </Inline>
              When a new customer is referred by the promotion code, this discount will be applied.
            </Box>
            
            <ButtonGroup >
              <Button onPress={() => { update_step_handler(step, 2) }} > <Icon name="arrowLeft" size="xsmall" /> Back</Button>
              <Button type="primary" onPress={() => {save_incentive_structure(coupon, {reward_amount, incentive_type, reward_currency, incentive_amount, incentive_currency, promo_code}); set_show_focus(false); onBack();}} >Save</Button>
            </ButtonGroup> */}
              </>
      : null }

      <Box css={{
          background: "container",
          borderRadius: "medium",
          marginY: "medium",
          padding: "large",
        }}>
        <Inline css={{font: 'body', color: 'primary', fontWeight: 'semibold'}}>Example: </Inline>
          When a new customer uses this promotion code, <Inline css={{fontWeight: 'semibold'}}>{promo_code ? promo_code?.code+',': ''}</Inline> they will recieve a discount 
          { coupon?.percent_off ? <> of <Inline css={{fontWeight: 'semibold'}}>{coupon?.percent_off}% off</Inline></>: null}
          { coupon?.amount_off ? <> of <Inline css={{fontWeight: 'semibold'}}>{coupon?.amount_off}{coupon?.currency} off</Inline></>: null}.
          When that customer makes a successfull payment, <Inline css={{fontWeight: 'semibold'}}>{customer.name}</Inline> will earn a <Inline css={{fontWeight: 'semibold'}}>{reward?.reward_amount} {reward?.reward_currency}</Inline> account credit.
      </Box>
  </FocusView>
)};

export default CreateIncentive;
