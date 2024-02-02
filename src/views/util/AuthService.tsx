import { ExtensionContextValue } from '@stripe/ui-extension-sdk/context';
import { createHttpClient, STRIPE_API_KEY } from '@stripe/ui-extension-sdk/http_client';
import Stripe from 'stripe';
import { get_user } from './UserService';

// Store the authorization token data.
export interface TokenData {
  id_token: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

// Create an instance of a Stripe object to access customer information.
// You don't need an API Key here, because the app uses the
// dashboard credentials to make requests.
const stripe: Stripe = new Stripe(STRIPE_API_KEY, {
  httpClient: createHttpClient() as Stripe.HttpClient,
  apiVersion: '2022-11-15',
});

const client_id = '2s4sl5acj7bou2r38frglj46dv'; // Cognito Client ID. Doesn't seem to be required to be private
const getRedirectURL = (mode: 'live' | 'test') => `https://dashboard.stripe.com/${mode === 'test' ? 'test/' : ''}apps-oauth/com.example.refer-a-friend`;
export const getAuthURL = (state: string, challenge: string, mode: 'live' | 'test') =>
  `https://auth.getfriendzy.com/login?response_type=code&client_id=${client_id}&redirect_uri=${getRedirectURL(mode)}&state=${state}&code_challenge=${challenge}&code_challenge_method=S256`;


export const is_authenticated = async ({userContext, environment, oauthContext}: ExtensionContextValue) => {
  const {id: userID} = userContext;
  const {mode} = environment;
  const code = oauthContext?.code || '';
  const verifier = oauthContext?.verifier || '';
  let friendzy_token: TokenData | null = null;

  // First, if we have an oauthContext from Stripe, then let's get a new token
  // This means that this is a redirect back from friendzy authentication
  if (code && verifier) { 
    const token_data = await getTokenFromAuthServer({code, verifier, mode});
    if (token_data && token_data.id_token && token_data.access_token) {
      saveTokenData({userID, tokenData: token_data}); // Save to Stripe Secret Store
      return await get_user(token_data.id_token, token_data.access_token)
    } else { 
      console.log("check")
      throw new Error('token_data is not what we expect')}
  // Second, this isn't a redirect back so let's look to see if we have a token 
  // in the Stripe Secret Store and try that out.
  } else if (!friendzy_token) {
    const token_data = await getTokenFromSecretStore(userID);
    if (token_data && token_data.id_token && token_data.access_token) {
      friendzy_token = token_data;
      const user = await get_user(token_data.id_token, token_data.access_token);
      return user;
    } else { console.log("check1"); throw new Error('token_data is not the shape we expect')}
  } else {
    console.log("we have friendzy_token already somehow")
  } 
}


// Fetch the authorization token
export const getTokenFromAuthServer = async ({code, verifier, mode}: {code: string, verifier: string, mode: 'live' | 'test'}): Promise<null | TokenData> => {
  try {
    const token_url = `https://auth.getfriendzy.com/oauth2/token?code=${code}&grant_type=authorization_code&code_verifier=${verifier}&client_id=${client_id}&redirect_uri=${getRedirectURL(mode)}`
    const response = await fetch(token_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (response.ok) {
      return await response.json();
    }
    throw new Error(await response.text());
  } catch (e) {
    console.error('Unable to retrieve token from authorization server:', (e as Error).message);
    return null;
  }
};

// Save the token to Secret Store API
export const saveTokenData = async ({userID, tokenData}: {userID: string, tokenData: TokenData}) => {
  try {
    await stripe.apps.secrets.create({
      scope: { type: 'user', user: userID },
      name: 'oauth_token',
      payload: JSON.stringify(tokenData),
    });
  } catch (e) {
    console.error('Unable to save token to Secret Store API:', (e as Error).message);
  }
}

// Read the token from Secret Store API
export const getTokenFromSecretStore = async (userID: string): Promise<TokenData | null> => {
  try {
    const response = await stripe.apps.secrets.find({
      scope: { type: 'user', user: userID },
      name: 'oauth_token',
      expand: ['payload'],
    });
    const secretValue: string = response.payload!;
    return JSON.parse(secretValue) as TokenData;
  } catch (e) {
    console.error('Unable to retrieve token from Secret Store API:', (e as Error).message);
    return null;
  }
};