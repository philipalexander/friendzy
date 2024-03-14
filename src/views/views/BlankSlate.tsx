// TODO:
// [] Go to docs section
// [] Example vid section

import {
  Box,
  Button,
} from "@stripe/ui-extension-sdk/ui";
import Stripe from 'stripe';


type BlankSlateProps = {
  customer: Stripe.Customer | Stripe.DeletedCustomer;
  on_create_incentive: () => void;
};

const BlankSlate = ({ customer, on_create_incentive }: BlankSlateProps) => {
  console.log('BlankSlate', customer, on_create_incentive)
  
  return (
    <>
      <Button css={{ width: 'fill' }} type="primary" onPress={() => {on_create_incentive(); console.log('Button was pressed: on_create_incentive')}}>Create incentive</Button>
      
      <Box
        css={{
          background: "container",
          borderRadius: "medium",
          font: 'body',
          fontWeight: 'semibold',
          color: 'primary',
          marginY: "medium",
          textAlign: 'center',
          padding: "large"
        }}
      >
        To get started, create an incentive for {customer?.deleted ? "this customer" : customer?.name} to refer their friends.
      </Box>
    </>
)};

export default BlankSlate;
