// TODO:

import { Box, Button, Inline, Table, TableBody, TableCell, TableRow} from "@stripe/ui-extension-sdk/ui";
import { useState } from "react";
import { ICoupon, IIncentiveMetadata, IPromo, IReward } from "./CreateIncentive";
import ErrorComponent, { ErrorProps } from "../components/error";
import Stripe from 'stripe';

type ShowIncentiveProps = {
  customer: Stripe.Customer ;
  coupon: ICoupon;
  promo_codes: IPromo[];
  reward: IReward;
  on_edit_incentive: () => void;
};

const ShowIncentive = ({ customer, coupon, promo_codes, reward, on_edit_incentive }: ShowIncentiveProps) => {
  const [error, set_error] = useState<ErrorProps | null>(null);

  console.log(customer, coupon, promo_codes, reward)
  // TODO: maybe we should just use the customer metadata instead of passing this in??
  // const [incentive_type, set_incentive_type] = useState(metadata.raf_incentive_type);
  // const [reward_amount, set_reward_amount] = useState(metadata.raf_reward_amount);
  // const [incentive_amount, set_incentive_amount] = useState(metadata.raf_incentive_amount);
  // const [incentive_currency, set_incentive_currency] = useState(metadata.raf_incentive_currency);
  // const [promo_code, set_promo_code] = useState(metadata.raf_promo_code);
  
  return (
    <Box css={{marginY: 'medium'}}>
      { error ? <ErrorComponent error_title={error?.error_title} error_message={error?.error_message} type={error?.type}  ></ErrorComponent> : null }

      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Promotion Code</TableCell>
            <TableCell>{promo_codes[0]?.code}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Reward</TableCell>
            <TableCell>{new Intl.NumberFormat("en-US", { style: "currency", currency: reward.reward_currency ? reward.reward_currency : 'usd'}).format(parseInt(reward.reward_amount))}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>New Customer Incentive</TableCell>
            {coupon.amount_off ? <TableCell>{new Intl.NumberFormat("en-US", { style: "currency", currency: coupon.currency ? coupon.currency : 'usd' }).format(coupon.amount_off)}</TableCell> : null }
            {coupon.percent_off ? <TableCell>{coupon.percent_off}%</TableCell> : null }
          </TableRow>
        </TableBody>
      </Table>

      <Box css={{background: "container",
          borderRadius: "medium",
          marginY: "medium",
          padding: "large"}}>When the promotion code 
        <Inline css={{fontWeight: 'semibold'}}> {promo_codes[0]?.code}</Inline> is applied to a customer, 
        <Inline css={{fontWeight: 'semibold'}}> {customer.name}</Inline> will earn a 
        <Inline css={{fontWeight: 'semibold'}}> {new Intl.NumberFormat("en-US", { style: "currency", currency: reward.reward_currency ? reward.reward_currency : 'usd'}).format(parseInt(reward.reward_amount))}</Inline> account credit 
        and the referred customer will receive a discount of 
        {coupon.amount_off ? <Inline css={{fontWeight: 'semibold'}}> {new Intl.NumberFormat("en-US", { style: "currency", currency: coupon.currency ? coupon.currency : 'usd' }).format(coupon.amount_off)}</Inline> : null }
        {coupon.percent_off ? ' '+coupon.percent_off+'%' : null }.
      </Box>
    
    <Box css={{marginY: 'medium', textAlign: 'right' }}>
      <Button css={{width: 'fill'}} type="primary" onPress={() => {on_edit_incentive()}}>Edit</Button>
    </Box>
  </Box>
)};

export default ShowIncentive;
