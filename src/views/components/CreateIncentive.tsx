import {
  Box,
  Button,
  FormFieldGroup,
  Radio,
  Select,
  TextField,
} from "@stripe/ui-extension-sdk/ui";
import { useState } from "react";

type CreateIncentiveProps = {
  shown: boolean;
  incentive: IIncentiveMetadata;
  onSave: (structure: IIncentiveStructure) => void;
  onBack: () => void;
};

export interface IIncentiveMetadata {
  raf_incentive_type: string;
  raf_reward_amount: string;
  raf_incentive_amount: string;
  raf_incentive_currency: string;
  raf_promo_code: string;
}

export interface IIncentiveStructure {
  incentive_type: string;
  reward_amount: string;
  incentive_amount: string;
  incentive_currency: string;
  promo_code: string;
}


const CreateIncentive = ({ shown, incentive, onSave, onBack }: CreateIncentiveProps) => {
  console.log('CreateIncentive', incentive)
  const [incentive_type, set_incentive_type] = useState(incentive.raf_incentive_type);
  const [reward_amount, set_reward_amount] = useState(incentive.raf_reward_amount);
  const [incentive_amount, set_incentive_amount] = useState(incentive.raf_incentive_amount);
  const [incentive_currency, set_incentive_currency] = useState(incentive.raf_incentive_currency);
  const [promo_code, set_promo_code] = useState(incentive.raf_promo_code);
  return (
    <Box>
      <Box css={{marginY: 'small'}}>
        <TextField 
          form="credit_form" 
          label="Reward Credit" 
          description="How much account credit should this customer earn when they successfully refer a friend?" 
          type="number" 
          defaultValue={reward_amount}
          required={true}
          placeholder="Reward Credit" 
          css={{width: 'fill'}} 
          onChange={(e)=>set_reward_amount(e.target.value)}/>
      </Box>
    
      <Box css={{
          font: 'body',
          fontWeight: 'semibold',
          color: 'primary',
          marginY: 'small',
        }}
      >
        Will the referred friend get a discount for a dollar amount off or a percent off?
        <FormFieldGroup>
          <Radio
            name="group"
            label="Amount Off"
            defaultChecked={incentive_type === "AMOUNT_OFF"}
            onChange={(e) => {
              console.log("AMOUNT_OFF");
              set_incentive_type("AMOUNT_OFF");
            }}
          />
          <Radio
            name="group"
            label="Percent Off"
            defaultChecked={incentive_type === "PERCENT_OFF"}
            onChange={(e) => {
              console.log("PERCENT_OFF");
              set_incentive_type("PERCENT_OFF");
            }}
          />
        </FormFieldGroup>  
      </Box>
    
    {/* AMOUNT OFF */}
    {incentive_type === "AMOUNT_OFF" ? (
      <Box>
        <Box css={{marginY: 'small'}}>
          <Select
            name="demo-001"
            label="Currency for the amount off"
            defaultValue={incentive_currency}
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
      
        <Box css={{marginY: 'small'}} >
          <TextField 
          label="Amount Discount" 
          description="" 
          type="number" 
          placeholder="Discount Amount" 
          css={{width: 'fill'}} 
          defaultValue={incentive_amount}
          required={true}
          onChange={(e)=>set_incentive_amount(e.target.value)}/>
        </Box>
      </Box>
    )  : null}

    {/* PERCENT OFF */}
    {incentive_type === "PERCENT_OFF" ? (
      <Box>
        <Box css={{marginY: 'small'}} >
          <TextField 
          label="Percent Discount" 
          description="" 
          type="number" 
          placeholder="Discount Percentage" 
          css={{width: 'fill'}} 
          onChange={(e)=>set_incentive_amount(e.target.value)}/>
        </Box>
      </Box>
    )  : null}

    <Box css={{marginY: 'small'}}>
      <TextField 
        label="Promotion Code" 
        description="This is the unique promotion code that this customer will share will friends." 
        type="text" 
        defaultValue={promo_code}
        placeholder="Promo Code" 
        css={{width: 'fill'}} 
        onChange={(e)=>set_promo_code(e.target.value)}/>
    </Box>

    <Box css={{marginY: 'small', textAlign: 'right' }}>
      <Button type="primary" onPress={() => {onSave({reward_amount, incentive_type, incentive_amount, incentive_currency, promo_code}); console.log('Button was pressed: Generate referral code')}}>Generate referral code</Button>
    </Box>
  </Box>
)};

export default CreateIncentive;
