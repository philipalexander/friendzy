import {
  Box,
  Button,
  Icon,
  Img,
  Inline,
  Link,
  SettingsView,
  SignInView,
  TextField,
} from "@stripe/ui-extension-sdk/ui";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";
import {useState, useEffect} from 'react';
import app_icon from './brand_icon.svg';

import { createHttpClient, STRIPE_API_KEY } from '@stripe/ui-extension-sdk/http_client';
import Stripe from 'stripe';
import {createOAuthState} from '@stripe/ui-extension-sdk/utils';

// Create an instance of a Stripe object to access customer information.
// You don't need an API Key here, because the app uses the
// dashboard credentials to make requests.
const stripe: Stripe = new Stripe(STRIPE_API_KEY, {
  httpClient: createHttpClient() as Stripe.HttpClient,
  apiVersion: '2022-11-15',
});

const clientID = '2s4sl5acj7bou2r38frglj46dv';
const getRedirectURL = (mode: 'live' | 'test') => `https://dashboard.stripe.com/${
  mode === 'test' ? 'test/' : ''
}apps-oauth/com.example.refer-a-friend`;
const getAuthURL = (state: string, challenge: string, mode: 'live' | 'test') =>
  `https://auth.friendzy.com/login?response_type=code&client_id=${clientID}&redirect_uri=${getRedirectURL(mode)}&state=${state}&code_challenge=${challenge}&code_challenge_method=S256`;


const AppSettings = ({userContext, environment}: ExtensionContextValue) => {
  const [status, setStatus] = useState('');

  const {mode} = environment;
  const [authURL, setAuthURL] = useState('');
  useEffect(() => {
    console.log('getAuthURL', getAuthURL)
    createOAuthState().then(({state, challenge}) => {
      console.log('state', state)
      console.log('challenge', challenge)
      // setAuthURL(getAuthURL(state, challenge, mode));
    });
  }, [mode]);

  // useEffect(() => {
  //   stripe.apps.secrets.create({
  //     scope: { type: 'user', user: userContext.id },
  //     name: 'friendzy_auth_code',
  //     payload: 'test_secret',
  //     expires_at: 1956528000  // optional
  //   }).then(resp => console.log(resp));
  // }, []);
  
  const isUserSignedIn = false;
  const saveSettings = async (values: any) => {
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

  return isUserSignedIn ? (
    <SettingsView 
      onSave={saveSettings}
      statusMessage={status}>

      <Box
        css={{
          background: "container",
          borderRadius: "medium",
          padding: "large",
        }}>


        {/* <Box css={{marginY: 'small'}} >
          <TextField 
          label="Email" 
          description="Your Friendzy account email address" 
          type="text" 
          placeholder="Email" 
          css={{width: 'fill'}} 
          required={true}
          />
        </Box>

        <Box css={{marginY: 'small'}} >
          <TextField 
          label="Password" 
          description="Your Friendzy account password" 
          type="password" 
          placeholder="password" 
          css={{width: 'fill'}} 
          required={true}
          />
        </Box> */}

        To get started, create a Friendzy account of sign into your existing account.
        <Box css={{ marginBottom: "small" }}>
          <Button type="primary">Create Account</Button>
        </Box>

        <Link
          target="_blank"
          href={"https://stripe.com/docs/stripe-apps/build-test-views#add-application-settings"}
        >
          <Box css={{ marginTop: "medium" }}>
            Or sign in to your existing Friendzy account{" "}
            <Icon name="arrowRight" size="xsmall" />
          </Box>
        </Link>

      </Box>
    </SettingsView>
  ) : (
    <SignInView
      description="Connect your SuperTodo account with Stripe."
      primaryAction={{label: 'Sign in', href: authURL}}
      footerContent={
        <>
          Don't have an account? <Link href={"authURL"}>Sign up</Link>
        </>
      }
      brandColor="#635bff"
      brandIcon={app_icon}
    />
  );
};

export default AppSettings;
