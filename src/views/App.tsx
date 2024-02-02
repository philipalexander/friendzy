// TODO:
// [] Brand header
// [] Branding footer
// [] Add loading state
// [] How to navigate between views

import { Box, ContextView, Img, Inline, Link, Radio, Select, SignInView, TextField } from "@stripe/ui-extension-sdk/ui";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";
import {Button} from '@stripe/ui-extension-sdk/ui';
import {FormFieldGroup} from '@stripe/ui-extension-sdk/ui';
import { useState, useEffect } from "react";
import BrandIcon from "./assets/images/undraw_spread_love.svg";
import CreateIncentive, { IIncentiveStructure } from "./views/CreateIncentive";
import BlankSlate from "./views/BlankSlate";
import ShowIncentive from "./views/ShowIncentive";
import { getTokenFromSecretStore, is_authenticated, TokenData } from "./util/AuthService";
import { add_stripe_metadata_to_customer, create_stripe_coupon, create_stripe_promo_code, get_customer } from "./util/StripeService";
import { IUser, get_user } from "./util/UserService";
import ErrorComponent, { ErrorProps } from "./components/error";
import { process_error } from "./util/error_service";
import NotificationComponent, { NotificationProps } from "./components/notification";

/**
 * This is a view that is rendered in the Stripe dashboard's customer detail page.
 * In stripe-app.json, this view is configured with stripe.dashboard.customer.detail viewport.
 * You can add a new view by running "stripe apps add view" from the CLI.
 */
const App = ({ userContext, environment, oauthContext }: ExtensionContextValue) => {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [error, set_error] = useState<ErrorProps | null>(null);
  const [friendzy_user, set_friendzy_user] = useState<IUser | null>(null);

  const [loading, set_loading] = useState(true);
  const [customer, set_customer]: any = useState({});
  const [incentive, set_incentive] = useState(null);
  const [show_create_incentive, set_show_create_incentive] = useState(false);
  const [notification, set_notification] = useState<NotificationProps | null>(null);
  useEffect(() => {

    is_authenticated({userContext, environment, oauthContext}).then((authenticated_user: any) => {
      set_friendzy_user({...authenticated_user})
    }).catch(error => {
      set_error(process_error(error))
    })


    // getTokenFromSecretStore(userContext.id).then(tokenData => {
    //   console.log("is this rurnning", tokenData)
    //   if (tokenData?.access_token) {
    //     get_user(tokenData?.id_token, tokenData?.access_token)
    //       .then(user => {set_notification({title: '', message: JSON.stringify(user), type: 'caution'})})
    //       // .catch(error => {set_error(process_error(error))})
    //   }
    //   setTokenData(tokenData);
    // });
  }, []);

  

  const load_customer = async () => {
    try {
      set_loading(true);
      const customer_id = environment.objectContext?.id;

      if (customer_id) {
        const customer = await get_customer(customer_id)
        const metadata = (customer as any).metadata
        if (metadata?.raf_promo_code) {
          set_incentive(metadata)
        }
        set_customer(customer); // After fetching data stored it in posts state.
      }
      
      set_loading(false); // Closed the loading page
    } catch (error) {
      set_error(process_error(error))
    }
      
  }

  useEffect(() => {
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
    paddingX: 'xlarge',
    borderRadius: 'small',
  }}>
    <Img
      src={BrandIcon}
      width="100%"
      alt="Refer a Friend"
    />
  </Box>
    { notification ? <NotificationComponent title={notification?.title} message={notification?.message} type={notification.type}></NotificationComponent> : null }
    { error ? <ErrorComponent error_title={error?.error_title} error_message={error?.error_message} type={error?.type}></ErrorComponent> : null }

    { incentive ? null : <BlankSlate customer={customer} on_create_incentive={() => set_show_create_incentive(true)}></BlankSlate> }
    
    { incentive ? <ShowIncentive customer={customer} metadata={incentive} on_edit_incentive={() => set_show_create_incentive(true)} ></ShowIncentive> : null }

    { show_create_incentive && <CreateIncentive shown={show_create_incentive} incentive={customer.metadata} onSave={(structure:IIncentiveStructure) => console.log(structure)} onBack={() => set_show_create_incentive(false)} userContext={userContext} environment={environment}></CreateIncentive> }

    TEST: {show_create_incentive.toString()}
    <Box css={{ height: "fill", stack: "y", distribute: "space-between" }}>
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

        <Box css={{ marginBottom: "medium", backgroundColor: 'container' }}>
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
    </Box>

    
  </ContextView>
  );
};

export default App;
export {default as CreateIncentive} from './views/CreateIncentive';