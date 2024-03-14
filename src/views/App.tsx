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
import CreateIncentive, { IIncentiveStructure, IReward } from "./views/CreateIncentive";
import BlankSlate from "./views/BlankSlate";
import ShowIncentive from "./views/ShowIncentive";
import { getAuthURL, getTokenFromSecretStore, is_authenticated, TokenData } from "./util/AuthService";
import { add_stripe_metadata_to_customer, create_stripe_coupon, create_stripe_promo_code, get_customer, get_promo_codes, get_stripe_coupon } from "./util/StripeService";
import { IUser, get_user } from "./util/UserService";
import ErrorComponent, { ErrorProps } from "./components/error";
import { process_error } from "./util/error_service";
import NotificationComponent, { NotificationProps } from "./components/notification";
import {createOAuthState} from '@stripe/ui-extension-sdk/utils';
import Footer from "./components/footer";
import Stripe from "stripe";


/**
 * This is a view that is rendered in the Stripe dashboard's customer detail page.
 * In stripe-app.json, this view is configured with stripe.dashboard.customer.detail viewport.
 * You can add a new view by running "stripe apps add view" from the CLI.
 */
const App = ({ userContext, environment, oauthContext, appContext }: ExtensionContextValue) => {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [error, set_error] = useState<ErrorProps | null>(null);
  const [friendzy_user, set_friendzy_user] = useState<IUser | null>(null);
  const [loading, set_loading] = useState(true);
  const [customer, set_customer]: any = useState(null);
  const [coupon, set_coupon]: any = useState();
  const [promo_codes, set_promo_codes]: any = useState();
  const [incentive, set_incentive] = useState(null);
  const [reward, set_reward] = useState<IReward | null>();
  const [show_create_incentive, set_show_create_incentive] = useState(false);
  const [notification, set_notification] = useState<NotificationProps | null>(null);
  const [auth_url, set_auth_url] = useState('');
  const {mode} = environment;
  
  useEffect(() => { // Check to see is this account is Authenticated with FriendZY
    is_authenticated({userContext, environment, oauthContext, appContext}).then((authenticated_user: any) => {
      set_friendzy_user({...authenticated_user})
    }).catch(error => {
      set_error(process_error(error))
    })
  }, []);

  useEffect(() => {
    try {
      createOAuthState().then(({state, challenge}) => { // TODO: maybe this should be it's own effect
        set_auth_url(getAuthURL(state, challenge, mode));
      });
    } catch (error) {
      set_error(process_error(error))
    }   
  }, []);



  useEffect(() => { // Load the Stripe information needed for this page
    if (environment.objectContext?.id) {
      load_incentive(environment.objectContext?.id);
    } else {
      set_error(process_error('This customer does not have an ID.'))
    }
  }, []);

  // Get the 3 parts of an incentive, the coupon, the promo code and the reward.
  const load_incentive = async (customer_id: string) => {
    try {
      set_loading(true);
      if (customer_id) {
        const customer = await get_customer(customer_id)    
        set_customer(customer); 
        const coupon = await get_stripe_coupon(customer_id);
        const promo_codes = await get_promo_codes(coupon.id)
        const metadata = customer.deleted ? null : customer.metadata;
        const reward: IReward = {
          reward_amount: metadata ? metadata.raf_reward_amount : '',
          reward_currency: metadata ? metadata.raf_reward_currency : ''
        }
        set_reward(reward);
        set_coupon(coupon);
        set_promo_codes(promo_codes.data)
      }
      set_loading(false);
    } catch (error) {
      set_error(process_error(error))
    }
  }

  return (
    <ContextView
      title="Refer a Friend"
      brandColor="#FF685C" // replace this with your brand color
      brandIcon={BrandIcon} // replace this with your brand icon
      externalLink={{
        label: "Friendzy Getting Started Docs",
        href: "https://getfriendzy.com/FIXME"
      }}
    >

    { loading ? <Box css={{ paddingX: 'xlarge', borderRadius: 'small'}}>
      LOADING...
    </Box> : null }

    { notification ? <NotificationComponent title={notification?.title} message={notification?.message} type={notification.type}></NotificationComponent> : null }
    { error ? <ErrorComponent error_title={error?.error_title} error_message={error?.error_message} type={error?.type} auth_url={auth_url}></ErrorComponent> : null }

    { customer && !(coupon && reward && promo_codes) ? <BlankSlate customer={customer} on_create_incentive={() => set_show_create_incentive(true)}></BlankSlate> : null}
    
    { coupon && reward && promo_codes ? <ShowIncentive customer={customer} coupon={coupon} promo_codes={promo_codes} reward={reward} on_edit_incentive={() => set_show_create_incentive(true)} ></ShowIncentive> : null }

    { show_create_incentive && <CreateIncentive customer={customer} current_coupon={coupon} current_promo_codes={promo_codes} current_reward={reward} userContext={userContext} onSave={() => {set_show_create_incentive(false)}} onBack={() => set_show_create_incentive(false)}></CreateIncentive> }

    <Footer></Footer>

    
  </ContextView>
  );
};

export default App;
export {default as CreateIncentive} from './views/CreateIncentive';