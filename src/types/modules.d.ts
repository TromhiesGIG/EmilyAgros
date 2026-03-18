declare module 'flutterwave-react-native' {
  import { ReactNode, ComponentType } from 'react';

  export interface FlutterwaveInitOptions {
    tx_ref: string;
    authorization: string;
    amount: number;
    currency: string;
    customer: {
      email: string;
      name?: string;
      phonenumber?: string;
    };
    customizations?: {
      title?: string;
      description?: string;
      logo?: string;
    };
  }

  export interface PayWithFlutterwaveProps {
    onRedirect: (data: any) => void;
    options: FlutterwaveInitOptions;
    customButton?: (props: { onPress: () => void; disabled?: boolean }) => ReactNode;  // Add ? to make it optional
  }

  const PayWithFlutterwave: ComponentType<PayWithFlutterwaveProps>;
  export default PayWithFlutterwave;
}