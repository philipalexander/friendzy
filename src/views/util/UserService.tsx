export interface IUser {
  cognito_username: string;
  email: string | undefined;
  stripe_connect_id?: string | undefined;
  stripe_customer_id?: string | undefined;
}

export async function get_user(id_token: string, access_token: string): Promise<IUser> {
    const url = `https://k9p06fdan6.execute-api.us-east-1.amazonaws.com/prod/user?access_token=${access_token}`
    const user_response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${id_token}` },
    });
    if (!(user_response.ok)) { throw new Error(user_response.status.toString()) }
    const user_message  = (await user_response.json()).message
    const remove_preamble = `{${user_message.substring(user_message.indexOf("{")+1)}`
    const shapped_user = JSON.parse(remove_preamble)
    return shapped_user;
};