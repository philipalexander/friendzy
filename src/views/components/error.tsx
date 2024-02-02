import {
  Banner, Button
} from "@stripe/ui-extension-sdk/ui";
import { getAuthURL } from "../util/AuthService";

export type ErrorProps = {
  error_title: string;
  error_message: string;
  type: 'critical' | 'caution' | 'default' | 'unathorized' | undefined;
  auth_url?: string;
};

const ErrorComponent = ({ error_title, error_message, type, auth_url }: ErrorProps) => {
  console.error('ErrorComponent', error_title, error_message, type)
  const banner_type = type === 'unathorized' ? 'critical' : type;
  return (
    <Banner
      type={banner_type}
      title={error_title}
      description={error_message}
      actions={ type === 'unathorized' ?
        <Button href={auth_url} target="_blank">Reactivate</Button>
      : null }
    />
)};

export default ErrorComponent;




