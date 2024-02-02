// TODO:
// [] input validation
// [] Save state message
// [] Exit state message
// [] Handle updating a coupon by adding a new promo code
// 

import {Box, Button, FormFieldGroup,  Radio, Select,  TextField, FocusView, ButtonGroup, Icon, Inline, Banner } from "@stripe/ui-extension-sdk/ui";
import { useEffect, useState } from "react";
import { add_stripe_metadata_to_customer, check_promo_code_exists, create_stripe_coupon, create_stripe_promo_code, get_stripe_coupon } from "../util/StripeService";
import ErrorComponent, { ErrorProps } from "../components/error";
import { process_error } from "../util/error_service";
import { showToast } from "@stripe/ui-extension-sdk/utils";

type CreateIncentiveProps = {
  shown: boolean;
  incentive: IIncentiveMetadata;
  onSave: (structure: IIncentiveStructure) => void;
  onBack: () => void;
  userContext: any;
  environment: any;
};

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

const confirmCloseMessages = {
  title: "Your mood will not be saved",
  description: "Are you sure you want to exit?",
  cancelAction: "Cancel",
  exitAction: "Exit",
};


const CreateIncentive = ({ shown, incentive, onSave, onBack, userContext, environment }: CreateIncentiveProps) => {
  // Dev mode only
  console.log('shown', shown)
  console.log('incentive', incentive)
  console.log('userContext', userContext)
  console.log('environment', environment)
  
  const [incentive_type, set_incentive_type] = useState(incentive.raf_incentive_type);
  const [reward_amount, set_reward_amount] = useState(incentive.raf_reward_amount);
  const [incentive_amount, set_incentive_amount] = useState(incentive.raf_incentive_amount);
  const [incentive_currency, set_incentive_currency] = useState(incentive.raf_incentive_currency);
  const [reward_currency, set_reward_currency] = useState(incentive.raf_reward_currency);
  const [promo_code, set_promo_code] = useState(incentive.raf_promo_code);
  const [promo_code_exists, update_promo_code_exists] = useState<boolean>();
  const [step, update_step] = useState<number>(1)
  const [confirmClose, setConfirmClose] = useState<boolean>(false);
  const [error, set_error] = useState<ErrorProps | null>(null);
  const [coupon, set_coupon] = useState<any | null>(null);
  const [show_focus, set_show_focus] = useState(shown);

  
  useEffect(() => {
    try {
      get_stripe_coupon(environment.objectContext.id).then(coupon => set_coupon(coupon))
    } catch (error) {
      set_error(process_error(error))
    }
    
  }, []); 

  async function check_promo_code_exists_handler(entered_code: string) {
    try {
      const code_res = await check_promo_code_exists(entered_code)
      if (code_res.data.length > 0) {update_promo_code_exists(true)} 
      else {update_promo_code_exists(false)}
    } catch (err) {
      set_error(process_error(err))
    }
  }

  function update_step_handler(step: number, change: -1 | 1) {
    if (step <= 1) {
      console.log('go back to prior view')
      set_show_focus(false)
    } else if (step > 2) {
      console.log('lets actually save the form now')
    }
    update_step(step+change)
  }

  async function save_incentive_structure(coupon: any, structure: IIncentiveStructure) {
    console.log('structure', structure)
    console.log('coupon', coupon)
    try {
      const customer_id = environment.objectContext?.id || '';
      const incentive_structure = structure;
      const coupon = await create_stripe_coupon(customer_id, incentive_structure)
      console.log('coupon', coupon)
   
      const promo_code = await create_stripe_promo_code(coupon.id, incentive_structure.promo_code)
      console.log('promo_code', promo_code)
      const metadata = {
        raf_promo_code: promo_code.code,
        raf_incentive_type: incentive_structure.incentive_type,
        raf_incentive_amount: incentive_structure.incentive_amount,
        raf_incentive_currency: incentive_structure.incentive_currency,
        raf_reward_amount: incentive_structure.reward_amount,
        raf_reward_currency: incentive_structure.reward_currency
      }
      const updated_customer = await add_stripe_metadata_to_customer(customer_id, metadata)
      showToast("Invoice updated", {type: "success"})
      console.log('updated_customer', updated_customer)
    } catch (err) {
      set_error(process_error(err))
      showToast("Invoice could not be updated", {type: "caution"})
    }
    
   
  }

  return (
    <FocusView 
      title="Create reward incentive" 
      confirmCloseMessages={confirmClose ? confirmCloseMessages : undefined}
      shown={show_focus}>
      <Inline css={{font: 'subheading'}}>Step {step} of 3</Inline>
      { error ? <ErrorComponent error_title={error?.error_title} error_message={error?.error_message} type={error?.type}></ErrorComponent> : null }

      {step === 1 ? 
      <>
        <Box css={{marginY: 'medium'}}>
          <TextField 
            label="Promotion Code" 
            description="This is the unique promotion code for this customer to refer their friends." 
            type="text" 
            error={promo_code_exists ? "This promotion code already exists. Please choose a unique code." : undefined}
            autoFocus={true}
            defaultValue={promo_code}
            placeholder="Promo Code" 
            css={{width: 'fill'}} 
            onChange={(e)=>{set_promo_code(e.target.value); check_promo_code_exists_handler(e.target.value)}}/>
        </Box>
        {/* {promo_code_exists ?  <Inline css={{font: 'body', color: 'attention', fontWeight: 'semibold'}}>This promotion code already exists. Please choose a unique code.</Inline> : null} */}
        <Box css={{
          background: "container",
          borderRadius: "medium",
          marginY: "medium",
          padding: "large",
        }}>
          <Inline css={{font: 'body', color: 'primary', fontWeight: 'semibold'}}>Example: </Inline>
          Adding a promotion code like, MEGSPING20, will allow your customer to send that code to a friend the earn a reward.
        </Box>
        
        <ButtonGroup>
          <Button onPress={() => { update_step_handler(step, -1) }} > <Icon name="arrowLeft" size="xsmall" /> Back</Button>
          <Button type="primary" onPress={() => {update_step_handler(step, 1)}} >Next</Button>
       </ButtonGroup>

      
      </>
      : null }

      {step === 2 ?   
      <>
      
        {/* <Box>How much account credit should this customer earn when they successfully refer a friend?</Box> */}
        <Box css={{ stack: 'x', gap: 'medium', marginY: 'medium' }}>
          <TextField 
            form="credit_form" 
            label="Reward Credit" 
            description="Account credit for the referring customer" 
            type="number" 
            defaultValue={reward_amount}
            required={true}
            placeholder="Reward Credit" 
            css={{width: '1/3'}} 
            onChange={(e)=>set_reward_amount(e.target.value)}/>

          <Select
            css={{width: '1/4'}}
            name="currency"
            label="Currency"
            description="Currency of the account credit" 
            defaultValue={reward_currency}
            onChange={(e) => {
              set_reward_currency(e.target.value)
            }}
          >
            <option value="">Choose an option</option>
            <option value="usd">USD</option>
            <option value="eur">EUR</option>
          </Select>
        </Box>

        <Box css={{
          background: "container",
          borderRadius: "medium",
          marginY: "medium",
          padding: "large",
        }}>
          <Inline css={{font: 'body', color: 'primary', fontWeight: 'semibold'}}>Example: </Inline>
           When a customer uses this promotion code and makes a successfull payment, this account credit will be applied to the refering customer.
        </Box>
        
        <ButtonGroup>
          <Button onPress={() => { update_step_handler(step, -1) }} > <Icon name="arrowLeft" size="xsmall" /> Back</Button>
          <Button type="primary" onPress={() => {update_step_handler(step, 1)}} >Next</Button>
        </ButtonGroup>
      </>
      : null }

      {step === 3 ? 
        <>
        <Box css={{
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
            
            {/* AMOUNT OFF */}
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
                  defaultValue={incentive_currency}
                  css={{width: '1/4'}}
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
        
            {/* PERCENT OFF */}
            {incentive_type === "PERCENT_OFF" ? (
              <Box>
                <Box css={{marginY: 'medium'}} >
                  <TextField 
                  label="Percent Discount" 
                  description="Must be a whole number" 
                  type="number" 
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
              <Button onPress={() => { update_step_handler(step, -1) }} > <Icon name="arrowLeft" size="xsmall" /> Back</Button>
              <Button type="primary" onPress={() => {save_incentive_structure(coupon, {reward_amount, incentive_type, reward_currency, incentive_amount, incentive_currency, promo_code}); set_show_focus(false)}} >Save</Button>
            </ButtonGroup>
              </>
      : null }

    
  </FocusView>
)};

export default CreateIncentive;
