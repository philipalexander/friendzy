// TODO:
// [] Brand header
// [] Branding footer
// [] fix 
// [] Add loading state
// [] How to navigate between views

import { Box, ContextView, Img, Inline, Link, Radio, Select, SignInView, TextField } from "@stripe/ui-extension-sdk/ui";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";
import {Button} from '@stripe/ui-extension-sdk/ui';
import {FormFieldGroup} from '@stripe/ui-extension-sdk/ui';
import { useState, useEffect } from "react";

import BrandIcon from "./assets/images/undraw_spread_love.svg";
import CreateIncentive, { IIncentiveStructure } from "./components/CreateIncentive";
import BlankSlate from "./components/BlankSlate";
import ShowIncentive from "./components/ShowIncentive";


import { createHttpClient, STRIPE_API_KEY } from '@stripe/ui-extension-sdk/http_client';
import Stripe from 'stripe';

// Create an instance of a Stripe object to access customer information.
// You don't need an API Key here, because the app uses the
// dashboard credentials to make requests.
const stripe: Stripe = new Stripe(STRIPE_API_KEY, {
  httpClient: createHttpClient() as Stripe.HttpClient,
  apiVersion: '2022-11-15',
});

/**
 * This is a view that is rendered in the Stripe dashboard's customer detail page.
 * In stripe-app.json, this view is configured with stripe.dashboard.customer.detail viewport.
 * You can add a new view by running "stripe apps add view" from the CLI.
 */
const App = ({ userContext, environment }: ExtensionContextValue) => {

  useEffect(() => {
    stripe.apps.secrets.find({
      scope: { type: 'user', user: userContext.id },
      name: 'friendzy_auth_code',
      expand: ['payload'],
    }).then(resp => console.log(resp.payload));
  }, []);


  async function create_coupon(customer_id: string | null | undefined) {
    const url = `http://localhost:8080/coupon?cust=${customer_id}`;
    const coupon_response = await fetch(url);
    return coupon_response;
  }

  async function create_promo_code(customer_id: string | null | undefined) {
    // const url = `http://localhost:8080/coupon?cust=${customer_id}`;
    // const coupon_response = await fetch(url);
    // return coupon_response;
  }

  async function get_customer(customer_id: string | null | undefined) {
    console.log('customer_id', customer_id)
    const url = `http://localhost:8080/incentive/${customer_id}`;
    return await fetch(url, {headers: {"Content-Type": "application/json"}});
  }

  function set_reward_type(e: any) {
    return console.log('set_reward_type', e)
  }

  async function save_incentive_structure(structure: IIncentiveStructure) {
    console.log('save_incentive_structure', JSON.stringify(structure))

    const url = `http://localhost:8080/incentive?cust=${environment.objectContext?.id}`;
    const coupon_response = await fetch(url, {method: "POST", mode: "cors", headers: {"Content-Type": "application/json"}, body: JSON.stringify(structure)});
    return coupon_response.body;
  }
  const [loading, set_loading] = useState(true);
  const [customer, set_customer]: any = useState({});
  const [incentive, set_incentive] = useState(null);
  const [show_create_incentive, set_show_create_incentive] = useState(false);


  useEffect(() => {
    console.log('useEffect')
    const load_customer = async () => {
      console.log('load_customer')
        // Till the data is fetch using API 
        // the Loading page will show.
        set_loading(true);

        // Await make wait until that 
        // promise settles and return its result
        const customer_res = await get_customer(environment.objectContext?.id)
        const customer = await customer_res.json()
        if (customer.metadata) {
          set_incentive(customer.metadata)
        }

        // After fetching data stored it in posts state.
        set_customer(customer);

        // Closed the loading page
        set_loading(false);
    }

    // Call the function
    load_customer();
}, []);

  return (
    <ContextView
      title="Refer a Friend"
      brandColor="#F6F8FA" // replace this with your brand color
      brandIcon={BrandIcon} // replace this with your brand icon
      externalLink={{
        label: "View docs",
        href: "https://stripe.com/docs/stripe-apps"
      }}
    >

  <Box css={{
    paddingX: 'xxlarge',
    borderRadius: 'small',
  }}>
    <Img
      src={BrandIcon}
      width="100%"
      alt="Refer a Friend"
    />
  </Box>

  <SignInView
  description="Connect your SuperTodo account with Stripe."
  primaryAction={{label: 'Sign in', href: 'https://auth.getfriendzy.com'}}
  footerContent={
    <>
      Don't have an account? <Link href="https://auth.getfriendzy.com">Sign up</Link>
    </>
  }
  brandColor="#635bff"

/>

    { incentive ? null : <BlankSlate customer={customer} on_create_incentive={() => console.log('time to create the incentive')}></BlankSlate> }
    
    { incentive ? <ShowIncentive customer={customer} metadata={incentive} on_edit_incentive={() => set_show_create_incentive(true)} ></ShowIncentive> : null }

    { show_create_incentive && <CreateIncentive shown={true} incentive={customer.metadata} onSave={(structure:IIncentiveStructure) => save_incentive_structure(structure)} onBack={() => console.log('On Back')} ></CreateIncentive> }

      {/* <Box css={{ height: "fill", stack: "y", distribute: "space-between" }}>
        <Box
          css={{
            background: "container",
            borderRadius: "medium",
            marginTop: "small",
            padding: "large",
          }}>
          Edit{" "}
          <Inline css={{ fontFamily: "monospace" }}>src/views/App.tsx</Inline>{" "}
          and save to reload this viewy.
        </Box>

        <Box css={{ color: "secondary" }}>
          <Box css={{ marginBottom: "medium" }}>
            Learn more about views, authentication, and accessing data in{" "}
            <Link
              href="https://stripe.com/docs/stripe-apps"
              target="blank"
              type="secondary"
            >
              Stripe Apps docs
            </Link>
            .
          </Box>

          <Box css={{ marginBottom: "medium" }}>
            Questions? Get help with your app from the{" "}
            <Link
              href="https://github.com/stripe/stripe-apps/wiki/Developer-Support"
              target="blank"
              type="secondary"
            >
              Stripe Apps wiki
            </Link>
            .
          </Box>
        </Box>
      </Box> */}

      
    </ContextView>
  );
};

export default App;
export {default as CreateIncentive} from './components/CreateIncentive';