import {Box, Button, TextField, ButtonGroup, Inline, Icon } from "@stripe/ui-extension-sdk/ui";
import { useState } from "react";
import { showToast } from "@stripe/ui-extension-sdk/utils";
import { IReward } from "../views/CreateIncentive";

type CreateEditRewardProps = {
  on_next: (new_reward: IReward) => void;
  on_back: () => void;
  existing_reward: IReward | null | undefined;
  customer_currency: string;
};

const CreateEditReward = ({ existing_reward, customer_currency, on_next, on_back}: CreateEditRewardProps) => {
  const [reward_amount, set_reward_amount] = useState(existing_reward?.reward_amount);
  // const [reward_error, set_reward_error] = useState<string>();
  // const [error, set_error] = useState<ErrorProps | null>(null);
  const [reward_invalid, set_reward_invalid] = useState(false);

  function save_reward_handler() {
    if (reward_invalid || !reward_amount) {
      showToast("This reward amount is invalid", {type: "caution"});
      return;
    } else {
      on_next({reward_amount, reward_currency: customer_currency}) // Tell Parent Component
    }
  }

  return (
    <>
    <Box css={{ stack: 'x', gap: 'medium', marginY: 'medium' }}>
      <TextField 
        form="credit_form" 
        label="Reward Credit" 
        description={`Account credit to be earned on a successfull referral. This customer's currency is ${customer_currency}.`}
        type="number"
        error={reward_amount ? undefined : 'A reward amount is required'}
        defaultValue={reward_amount}
        required={true}
        placeholder="Reward Credit" 
        css={{width: 'fill'}} 
        onChange={(e)=>set_reward_amount(e.target.value)}/>
    </Box>

    <Box css={{
    background: "container",
    borderRadius: "medium",
    marginY: "medium",
    padding: "large",
    }}>
      <Inline css={{font: 'body', color: 'primary', fontWeight: 'semibold'}}>Example: </Inline>
      {customer_currency} When a customer uses this promotion code and makes a successfull payment, this account credit will be applied to the refering customer.
    </Box>

    <ButtonGroup>
      <Button css={{width: '1/2'}} onPress={() => { on_back() }} > <Icon name="arrowLeft" size="xsmall" /> Back</Button>
      { !reward_amount ?<Button css={{width: '1/2'}} type="primary" disabled onPress={() => {save_reward_handler()}} >Next</Button> : null }
      { reward_amount ?<Button css={{width: '1/2'}} type="primary" onPress={() => {save_reward_handler()}} >Next</Button> : null }
    </ButtonGroup>
    </>  
)};

export default CreateEditReward;
