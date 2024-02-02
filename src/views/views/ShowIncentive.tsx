// TODO:

import { Box, Button, Inline, Table, TableBody, TableCell, TableRow} from "@stripe/ui-extension-sdk/ui";
import { useState } from "react";
import { IIncentiveMetadata } from "./CreateIncentive";
import ErrorComponent, { ErrorProps } from "../components/error";

type ShowIncentiveProps = {
  customer: any; // TODO: Stripe probably has a type for this
  metadata: IIncentiveMetadata;
  on_edit_incentive: () => void;
};

const ShowIncentive = ({ customer, metadata, on_edit_incentive }: ShowIncentiveProps) => {
  const [error, set_error] = useState<ErrorProps | null>(null);
  // TODO: maybe we should just use the customer metadata instead of passing this in??
  const [incentive_type, set_incentive_type] = useState(metadata.raf_incentive_type);
  const [reward_amount, set_reward_amount] = useState(metadata.raf_reward_amount);
  const [incentive_amount, set_incentive_amount] = useState(metadata.raf_incentive_amount);
  const [incentive_currency, set_incentive_currency] = useState(metadata.raf_incentive_currency);
  const [promo_code, set_promo_code] = useState(metadata.raf_promo_code);
  
  return (
    <Box css={{marginY: 'medium'}}>
      { error ? <ErrorComponent error_title={error?.error_title} error_message={error?.error_message} type={error?.type}  ></ErrorComponent> : null }

      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Promotion Code</TableCell>
            <TableCell>{promo_code}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Reward</TableCell>
            <TableCell>{new Intl.NumberFormat("en-US", { style: "currency", currency: metadata.raf_reward_currency ? metadata.raf_reward_currency : 'usd'}).format(parseInt(reward_amount))}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>New Customer Incentive</TableCell>
            {incentive_type === "AMOUNT_OFF" ? <TableCell>{new Intl.NumberFormat("en-US", { style: "currency", currency: incentive_currency ? incentive_currency : 'usd' }).format(parseInt(incentive_amount))}</TableCell> : null }
            {incentive_type === "PERCENT_OFF" ? <TableCell>{incentive_amount}%</TableCell> : null }
          </TableRow>
        </TableBody>
      </Table>


      <Box css={{marginY: 'medium'}}>When the promotion code 
        <Inline css={{fontWeight: 'semibold'}}> {promo_code}</Inline> is applied to a customer, 
        <Inline css={{fontWeight: 'semibold'}}> {customer.name}</Inline> will earn a 
        <Inline css={{fontWeight: 'semibold'}}> {new Intl.NumberFormat("en-US", { style: "currency", currency: metadata.raf_reward_currency ? metadata.raf_reward_currency : 'usd'}).format(parseInt(reward_amount))}</Inline> account credit 
        and the referred customer will receive a discount of 
        {incentive_type === "AMOUNT_OFF" ? <Inline css={{fontWeight: 'semibold'}}> {new Intl.NumberFormat("en-US", { style: "currency", currency: incentive_currency ? incentive_currency : 'usd' }).format(parseInt(incentive_amount))}</Inline> : null }
        {incentive_type === "PERCENT_OFF" ? ' '+incentive_amount+'%' : null }.
      </Box>
    
    <Box css={{marginY: 'medium', textAlign: 'right' }}>
      <Button css={{width: 'fill'}} type="primary" onPress={() => {on_edit_incentive()}}>Edit</Button>
    </Box>
  </Box>
)};

export default ShowIncentive;
