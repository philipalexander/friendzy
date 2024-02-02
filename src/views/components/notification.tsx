import { Banner } from "@stripe/ui-extension-sdk/ui";

export type NotificationProps = {
  title: string;
  message: string;
  type: 'critical' | 'caution' | 'default' | undefined;
};

const NotificationComponent = ({ title, message, type }: NotificationProps) => {
  console.log('Notification', title, message)
  return (
    <>
      <Banner
        type={type}
        title={title}
        description={message}
        // actions={
        //   <Button onPress={() => console.log('hello world')}>Update bank account</Button>
        // }
      />
    </>
)};

export default NotificationComponent;




