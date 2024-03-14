import {Box, Button, TextField, ButtonGroup, Inline, Icon, FormFieldGroup, Radio, Select } from "@stripe/ui-extension-sdk/ui";
import { useState } from "react";
import { showToast } from "@stripe/ui-extension-sdk/utils";
import { ICoupon, IReward } from "../views/CreateIncentive";
import { stripe_currencies } from "../util/stripe_currencies";

type CreateEditCouponProps = {
  on_next: (new_reward: ICoupon) => void;
  on_back: () => void;
  existing_coupon: ICoupon | null | undefined;
  customer_currency: string;
};

const CreateEditCoupon = ({ existing_coupon, customer_currency, on_next, on_back}: CreateEditCouponProps) => {
  const [coupon_amount_off, set_coupon_amount_off] = useState(existing_coupon?.amount_off);
  const [coupon_percent_off, set_coupon_percent_off] = useState(existing_coupon?.percent_off);
  // const [reward_error, set_reward_error] = useState<string>();
  // const [error, set_error] = useState<ErrorProps | null>(null);
  const [coupon_currency, set_coupon_currency] = useState(existing_coupon?.currency);
  const [coupon_invalid, set_coupon_invalid] = useState(false);
  const [incentive_type, set_incentive_type] = useState(existing_coupon?.amount_off ? "AMOUNT_OFF": "PERCENT_OFF");

  function save_coupon_handler() {
    if ((incentive_type === "PERCENT_OFF" && !coupon_percent_off) || (incentive_type === "AMOUNT_OFF" && (!coupon_amount_off || !coupon_currency))) {
      showToast("This coupon is invalid", {type: "caution"});
      return;
    } else {
      let coupon: ICoupon | null;
      if (incentive_type === "AMOUNT_OFF") {
        coupon = {id: existing_coupon?.id || '', amount_off: coupon_amount_off, percent_off: null, currency: coupon_currency }
      } else {
        coupon = {id: existing_coupon?.id || '', amount_off: null, percent_off: coupon_percent_off, currency: null }
      }
      on_next(coupon) // Tell Parent Component
    }
  }

  return (
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
          description="Discount amount in cents. Must be a number." 
          type="number" 
          placeholder="Discount Amount" 
          css={{width: '1/2' }} 
          defaultValue={coupon_amount_off?.toString()}
          error={coupon_amount_off ? undefined : 'An amount is required'}
          required={true}
          onChange={(e)=>set_coupon_amount_off(parseInt(e.target.value))}
        /> 

        <Select
          name="demo-001"
          label="Currency"
          description="Choose from list" 
          defaultValue={coupon_currency ? coupon_currency : ''}
          css={{width: '1/2'}}
          required={true}
          onChange={(e) => {
            set_coupon_currency(e.target.value)
          }}
        >
          <option value="">Choose a currency</option>
          { stripe_currencies.map(currency => { return <option value={currency.code}>{currency.code}</option>})}
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
          defaultValue={coupon_percent_off?.toString()}
          required={true}
          error={coupon_percent_off ? undefined : 'An amount is required'}
          placeholder="Discount Percentage" 
          css={{width: 'fill'}} 
          onChange={(e)=>set_coupon_percent_off(parseInt(e.target.value))}/>
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
      <Button css={{width: '1/2'}} onPress={() => {  on_back() }} > <Icon name="arrowLeft" size="xsmall" /> Back</Button>
      { (incentive_type === "AMOUNT_OFF" && coupon_amount_off && coupon_currency) || (incentive_type === "PERCENT_OFF" && coupon_percent_off) ? <Button css={{width: '1/2'}} type="primary" onPress={() => {save_coupon_handler()}} >Save</Button> : null }
      { (incentive_type === "AMOUNT_OFF" && (!coupon_amount_off || !coupon_currency)) || (incentive_type === "PERCENT_OFF" && !coupon_percent_off) ? <Button css={{width: '1/2'}} type="primary" disabled onPress={() => {save_coupon_handler()}} >Save</Button> : null }
    </ButtonGroup>
    </>  
)};

export default CreateEditCoupon;
