import {
  Box,
  Icon,
  Link,
  SettingsView,
  SignInView,
} from "@stripe/ui-extension-sdk/ui";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";
import {useState, useEffect} from 'react';
import app_icon from './brand_icon.svg';
import {createOAuthState} from '@stripe/ui-extension-sdk/utils';
import { getAuthURL, is_authenticated } from "./util/AuthService";
import { IUser } from "./util/UserService";
import ErrorComponent, { ErrorProps } from "./components/error";
import { process_error } from "./util/error_service";

const AppSettings = ({userContext, environment, oauthContext}: ExtensionContextValue) => {
  const [status, setStatus] = useState('');
  const [auth_url, set_auth_url] = useState('');
  const [error, set_error] = useState<ErrorProps | null>(null);
  const [signed_in, set_signed_in] = useState(false);
  const [friendzy_user, set_friendzy_user] = useState<IUser | null>(null);
  const {mode} = environment;

  useEffect(() => {
    try {
      is_authenticated({userContext, environment, oauthContext}).then((authenticated_user: any) => {
        set_signed_in(true)
        set_friendzy_user({...authenticated_user})
      }).catch(error => {
        set_error(process_error(error))
        set_signed_in(false)
      })

      createOAuthState().then(({state, challenge}) => { // TODO: maybe this should be it's own effect
        set_auth_url(getAuthURL(state, challenge, mode));
      });
    } catch (error) {
      set_error(process_error(error))
      set_signed_in(false)
    }   
    
  }, []);
 
  const saveSettings = async (values: any) => {
    console.log("saveSettings is not implemented");
    try {
      setStatus('Saving...');
      // Extract our fields from the values object. The key is the name attribute of the form element.
      const { firstname, lastname } = values;
      // Make a POST request to an external API
      // const result = await fetch(
      //   'https://www.my-api.com/',
      //   {
      //     method: 'POST',
      //     body: JSON.stringify({
      //       fullName: `${firstname} ${lastname}`,
      //     }),
      //   }
      // );
      // await result.text();
      setStatus('Saved!');
    } catch (error) {
      console.error(error);
      setStatus('There was an error saving your settings.');
    }
  };

  return (
  <>
    { error ? <ErrorComponent error_title={error?.error_title} error_message={error?.error_message} type={error?.type} auth_url={auth_url}></ErrorComponent> : null }
    { signed_in ? <SettingsView /*onSave={saveSettings}*/ statusMessage={status}>
    Welcome! You're authenticated with your Friendzy account {friendzy_user?.cognito_username}.

    <Box css={{ stack: 'x', gap: 'medium', marginY: 'medium' }}>
      <Box css={{
          background: "container",
          borderRadius: "medium",
          padding: "large",
        }}>
        
        <Box css={{stack: 'x', alignX: 'center'}}><Icon name="check" size="xlarge" css={{ fill: 'success'}} /></Box>
        <Box>You're authenticated with your Friendzy account {friendzy_user?.email}.</Box>

        <Link target="_blank" href={"https://getfriendzy.com/#"} >
          <Box css={{ marginTop: "medium" }}>
            Log in to your Friendzy account to manage your billing{" "}
            <Icon name="arrowRight" size="xsmall" />
          </Box>
        </Link>

      </Box>
      <Box css={{
          background: "container",
          borderRadius: "medium",
          padding: "large",
        }}>
        { friendzy_user?.stripe_connect_id  ? 
        <><Box css={{stack: 'x', alignX: 'center'}}><Icon name="check" size="xlarge" css={{ fill: 'success'}} /></Box>
        
        <Box>You've connected a Stripe account to Friendzy: {friendzy_user?.stripe_connect_id}</Box>

        <Link target="_blank" href={"https://getfriendzy.com/#"} >
          <Box css={{ marginTop: "medium" }}>
            Log into your Friendzy account to authenticate a different Stripe account{" "}
            <Icon name="arrowRight" size="xsmall" />
          </Box>
        </Link>
        </>
        : <><Box css={{stack: 'x', alignX: 'center'}}><Icon name="cancelCircle" size="xlarge" css={{ fill: 'critical'}} /></Box>
        
        <Box>You've don't have a Stripe account connected to Friendzy. To apply the account credit when a referral is made, you'll need to authorize Friendzy to receive webhooks from your Stripe account.</Box>

        <Link target="_blank" href={"https://getfriendzy.com/#"} >
          <Box css={{ marginTop: "medium" }}>
            Log into your Friendzy account to authenticate a Stripe account{" "}
            <Icon name="arrowRight" size="xsmall" />
          </Box>
        </Link></>}

        <Link target="_blank" href={"https://getfriendzy.com/#"} >
          <Box css={{ marginTop: "medium" }}>
            Read more about why Friendzy needs to connect to your Stripe account{" "}
            <Icon name="arrowRight" size="xsmall" />
          </Box>
        </Link>

      </Box>
    </Box>
      
    </SettingsView>
   : 
    <>
      { auth_url ? <SignInView
        description="Connect your Friendzy account with Stripe."
        primaryAction={{label: 'Sign in', href: auth_url}}
        footerContent={
          <>
            Don't have an account? <Link href={auth_url}>Sign up</Link>
          </>
        }
        brandColor="#635bff"
        brandIcon={app_icon}
      /> : null }
    </>
    }
  </>
    
  );
};

export default AppSettings;
