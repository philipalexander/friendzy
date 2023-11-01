// TODO:
// [] fix FIXMEs
// [] Currency handler

import { Box, Button, Inline, Radio, Select, TextField} from "@stripe/ui-extension-sdk/ui";
import { useState } from "react";
import { IIncentiveMetadata } from "./CreateIncentive";

type ShowIncentiveProps = {
  customer: any; // FIXME: Stripe probably has a type for this
  metadata: IIncentiveMetadata;
  on_edit_incentive: () => void;
};

const ShowIncentive = ({ customer, metadata, on_edit_incentive }: ShowIncentiveProps) => {
  console.log('ShowIncentive', customer, metadata)
  const [incentive_type, set_incentive_type] = useState(metadata.raf_incentive_type);
  const [reward_amount, set_reward_amount] = useState(metadata.raf_reward_amount);
  const [incentive_amount, set_incentive_amount] = useState(metadata.raf_incentive_amount);
  const [incentive_currency, set_incentive_currency] = useState(metadata.raf_incentive_currency);
  const [promo_code, set_promo_code] = useState(metadata.raf_promo_code);
  return (
    <Box>
      <Inline>When the promotion code {promo_code} is applied to a customer, {customer.name} will earn a {reward_amount} account credit 
      and the referred customer will receive discount of {incentive_type === "AMOUNT_OFF" ? incentive_currency : null }{incentive_amount} {incentive_type === "PERCENT_OFF" ? 'percent' : null } off.</Inline>
    
    <Box css={{marginY: 'small', textAlign: 'right' }}>
      <Button type="primary" onPress={() => {on_edit_incentive(); console.log('Button was pressed: on_edit_incentive')}}>Edit Incentive</Button>
    </Box>
  </Box>
)};

export default ShowIncentive;
