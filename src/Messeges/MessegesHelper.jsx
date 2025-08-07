import {View, Text} from 'react-native';
import React from 'react';

const MESSAGE_HELPER_DATA = {
  Error: {
    InternetError: {
      title: 'Internet Error',
      message: 'Please check your internet connection and try again.',
      button: 'Retry',
    },
    ServerError: {
      title: 'Server Error',
      message: 'Please try again later.',
      button: 'Retry',
    },
  },
  Information: {
    NewUpdateAvailable: {
      title: 'New Update Available',
      message: 'Please update your app to the latest version.',
      button: 'Update',
    },
  },
};

export default function MessegeHelper() {
  return (
    <View>
      <Text>MessegesHelper</Text>
    </View>
  );
}

export function ErrorHelper() {
  return (
    <View>
      <Text>ErrorHelper</Text>
    </View>
  );
}

export function InformationMessage() {
  return (
    <View>
      <Text>InformationMessage</Text>
    </View>
  );
}
