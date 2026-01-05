import {
  StyleSheet,
  Text,
  TouchableOpacity as RNTouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {H3} from '../Styles/Fonts';
import {useState, useEffect} from 'react';

export function TouchableOpacity(props) {
  const {style, onPress, children, ...restProps} = props;

  return (
    <RNTouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      delayLongPress={200}
      activeOpacity={0.8}
      {...restProps}>
      {children}
    </RNTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {},
});
