import {
  StyleSheet,
  Text,
  TouchableOpacity as TouchableOpacity_,
} from 'react-native';
import {appColor, loaderColor, white} from '../Styles/Colors';
import {H3} from '../Styles/Fonts';
import {useState, useEffect} from 'react';
import {ActivityIndicator} from 'react-native';

export function TouchableOpacity(props) {
  const {style, onPress, children, ...restProps} = props;
  
  return (
    <TouchableOpacity_
      style={[styles.button, style]}
      onPress={onPress}
      delayLongPress={200}
      activeOpacity={0.8}
      {...restProps}>
      {children}
    </TouchableOpacity_>
  );
}

const styles = StyleSheet.create({
  button: {},
});
