// TODO:
// [] Layout doesn't look quite right
// [] Go to docs section
// [] Example vid section
// [] Connect up the create incentive button
// [] fix FIXMEs

import {
  Box,
  Button,
} from "@stripe/ui-extension-sdk/ui";

type BlankSlateProps = {
  customer: any; // FIXME: Stripe probably has a type for this
  on_create_incentive: () => void;
};

const BlankSlate = ({ customer, on_create_incentive }: BlankSlateProps) => {
  console.log('BlankSlate', customer, on_create_incentive)
  
  return (
    <Box>
    <Box
      css={{
        font: 'body',
        fontWeight: 'semibold',
        color: 'primary',
        marginY: 'large',
        textAlign: 'center'
      }}
    >
      To get started, create a promo code that {customer.name} can use to refer friends.
    </Box>

    <Box
      css={{
        font: 'body',
        fontWeight: 'semibold',
        color: 'primary',
        marginY: 'large',
        textAlign: 'center'
      }}
    >
      Then, share the promo code and the reward will be applied to this customer when the referred customer makes their first successful payment.
    </Box>

    <Button type="primary" onPress={() => {on_create_incentive(); console.log('Button was pressed: on_create_incentive')}}>Create Incentive</Button>

  </Box>
)};

export default BlankSlate;
