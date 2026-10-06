import { Platform, Linking, Alert } from 'react-native';

// TODO: Replace with actual App Store ID after App Store submission
const IOS_APP_ID     = 'YOUR_APP_STORE_ID';
const ANDROID_PACKAGE = 'com.emilyagros.app';

const IOS_URL     = `https://apps.apple.com/app/id${IOS_APP_ID}?action=write-review`;
const ANDROID_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}&showAllReviews=true`;

export const rateUs = async () => {
  const url = Platform.OS === 'ios' ? IOS_URL : ANDROID_URL;
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'Rate Us',
        'We would love to hear your feedback! Please find us on the App Store or Play Store.',
      );
    }
  } catch (e) {
    Alert.alert('Error', 'Could not open the store. Please try again.');
  }
};