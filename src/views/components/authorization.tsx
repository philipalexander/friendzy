import {
  Banner, Button
} from "@stripe/ui-extension-sdk/ui";

export type AuthNoticeComponentProps = {
  auth_url: string;
};

const AuthNoticeComponent = ({ auth_url }: AuthNoticeComponentProps) => {
  return (
    <Banner
      type="critical"
      title="Authorization has expired"
      description="Please sign in to your Friendzy account to continue using the app."
      actions={
        <Button href={auth_url} target="_blank">Reactivate</Button>
      }
    />
)};

export default AuthNoticeComponent;




