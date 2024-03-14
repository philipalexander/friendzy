import {Box, Button, TextField, ButtonGroup, Inline } from "@stripe/ui-extension-sdk/ui";
import { useState } from "react";
import { activate_stripe_promo_code, check_promo_code_exists, deactivate_stripe_promo_code } from "../util/StripeService";
import ErrorComponent, { ErrorProps } from "../components/error";
import { process_error } from "../util/error_service";
import { showToast } from "@stripe/ui-extension-sdk/utils";
import { useDebounce } from "../util/debounce";
import Stripe from "stripe";
import { IPromo } from "../views/CreateIncentive";

type CreateEditPromoCodeProps = {
  on_next: (new_promo: string) => void;
  existing_promo_codes: IPromo[] | null | undefined;
};

const CreateEditPromoCode = ({ existing_promo_codes, on_next}: CreateEditPromoCodeProps) => {
  // TODO: when this supports multiple promo codes this will need to be updated
  const existing_promo = existing_promo_codes ? existing_promo_codes[0]?.code : '';

  const [promo_code, set_promo_code] = useState(existing_promo);
  const [promo_code_error, set_promo_code_error] = useState<string>();
  const [error, set_error] = useState<ErrorProps | null>(null);
  const [promo_invalid, set_promo_invalid] = useState(false);
  const [full_promo, set_full_promo] = useState<any>();

  function promo_code_update_handler(entered_code: string) {
    try {
      set_promo_code(entered_code); 
      debounced_request()
    } catch (err) {
      set_error(process_error(err))
    }
  }

  const debounced_request = useDebounce(() => {
    promo_code_check(promo_code, existing_promo)
  });

  async function promo_code_check(entered_code: string, old_promo: string) {
    
    try {
      const re_alphanumeric = /^[a-zA-Z0-9]+$/;
      const evaluated_expression = re_alphanumeric.exec(entered_code)
      if (!entered_code) { // Check to make sure it's not blank
        set_promo_invalid(true)
        set_promo_code_error('A promotion code is required.')
        return
      }
      if (!evaluated_expression) { // Check to make sure it's alphanumeric
        set_promo_invalid(true)
        set_promo_code_error('Promotion codes must be alphanumeric.')
        return
      }
      if (entered_code === old_promo) { // They just retyped the same code
        set_promo_invalid(false)
        return 
      } 
      const codes = await check_promo_code_exists(entered_code)
      const active_codes = codes.data.map(code => {
        if (code.active) return code;
      })
      if (active_codes.length > 0) { // Check to see if this promo code already exists
        set_promo_invalid(true)
        set_promo_code_error('This promotion code already exists.')
        return
      } 
      set_promo_invalid(false)
    } catch (err) {
      set_error(process_error(err))
    }
  }

  function save_promo_code_handler() {
    if (promo_invalid) {
      showToast("This promotion code is invalid", {type: "caution"});
      return;
    } else {
      on_next(promo_code) // Tell Parent Component that we have a valid promo code
    }
  }

  async function test() {
    const test = await check_promo_code_exists(promo_code);
    console.log('test', test)
    set_full_promo(test.data[0])
    // const reactivated =  activate_stripe_promo_code(test.data[0].id)
    // console.log("reactivated", reactivated)
  }

  async function delete_promo(id: string) {
    const deleted_promo = await deactivate_stripe_promo_code(id);
    console.log('deleted_promo', deleted_promo)
  }

  return (
    <>
      { error ? <ErrorComponent error_title={error?.error_title} error_message={error?.error_message} type={error?.type}></ErrorComponent> : null }
      <Box css={{marginY: 'medium'}}>
        <TextField 
          label="Promotion Code" 
          description="Enter a unique promotion code." 
          type="text" 
          error={ !promo_code || promo_invalid ? promo_code_error : undefined}
          autoFocus={true}
          defaultValue={promo_code}
          placeholder="Promo Code" 
          required={true}
          invalid={!promo_code || promo_invalid}
          css={{width: 'fill'}} 
          onChange={(e)=>{promo_code_update_handler(e.target.value)}}/>
      </Box>
      <Box css={{
        background: "container",
        borderRadius: "medium",
        marginY: "medium",
        padding: "large",
      }}>
        <Inline css={{font: 'body', color: 'primary', fontWeight: 'semibold'}}>Example: </Inline>
        When the code {promo_code ? promo_code : "EXAMPLE_CODE"} is redeemed, the referred customer will have a coupon applied. And when that customer pays, this customer will earn an account credit.
      </Box>

      PROMO: {full_promo?.id}

      {/* <Button css={{width: 'fill'}} type="primary" onPress={() => {test()}}>TEST</Button>
      <Button css={{width: 'fill'}} type="primary" onPress={() => {delete_promo(full_promo?.id)}}>DELETE PROMO</Button> */}
      
      <ButtonGroup>
        { !promo_code ? <Button css={{width: 'fill'}} type="primary" disabled={true} onPress={() => {save_promo_code_handler()}}>Next</Button> : null}
        { promo_code ? <Button css={{width: 'fill'}} type="primary" onPress={() => {save_promo_code_handler()}}>Next</Button> : null }
      </ButtonGroup>
    </>  
)};

export default CreateEditPromoCode;
