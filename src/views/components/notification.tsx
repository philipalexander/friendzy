import { Banner, Box } from "@stripe/ui-extension-sdk/ui";

export type NotificationProps = {
  title: string;
  message: string;
  type: 'critical' | 'caution' | 'default' | undefined;
};

const NotificationComponent = ({ title, message, type }: NotificationProps) => {
  return (
    <Box css={{marginY: 'small'}}>
      <Banner
        type={type}
        title={title}
        description={message}
        // actions={
        //   <Button onPress={() => console.log('hello world')}>Update bank account</Button>
        // }
      />
    </Box>
)};

export default NotificationComponent;




