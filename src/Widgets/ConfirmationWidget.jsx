import React, {useEffect, useRef, useCallback} from 'react';
import {Animated, StyleSheet, TouchableOpacity, View} from 'react-native';
import {appColor, white} from '../Styles/Colors';
import {H4, H5, H6, H7} from '../Styles/Fonts';

const WIDGET_HEIGHT = 70;
const ANIMATION_DURATION = 250;

function ConfirmationWidget({
  message,
  visible,
  onConfirm,
  onDecline,
  onHide,
  confirmText = 'Так',
  declineText = 'Ні',
}) {
  const heightAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const animate = useCallback(
    toValue => {
      Animated.sequence([
        Animated.timing(heightAnim, {
          toValue: toValue ? WIDGET_HEIGHT : 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: false,
        }),
        Animated.timing(contentOpacity, {
          toValue: toValue ? 1 : 0,
          duration: ANIMATION_DURATION / 2,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [heightAnim, contentOpacity],
  );

  const hide = useCallback(() => {
    Animated.sequence([
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: ANIMATION_DURATION / 2,
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  }, [heightAnim, contentOpacity, onHide]);

  const handleConfirm = () => {
    hide();
    onConfirm && onConfirm();
  };

  const handleDecline = () => {
    hide();
    onDecline && onDecline();
  };

  useEffect(() => {
    if (visible) {
      animate(true);
    }
  }, [visible, animate]);

  if (!visible && heightAnim._value === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          maxHeight: heightAnim,
          opacity: heightAnim.interpolate({
            inputRange: [0, WIDGET_HEIGHT],
            outputRange: [0, 1],
          }),
        },
      ]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentOpacity,
          },
        ]}>
        <View style={styles.messageContainer}>
          <Animated.Text style={[H6, styles.message]} numberOfLines={2}>
            {message}
          </Animated.Text>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}>
              <Animated.Text style={[H7, styles.buttonText]}>
                {confirmText}
              </Animated.Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.declineButton]}
              onPress={handleDecline}>
              <Animated.Text
                style={[H7, styles.buttonText, styles.declineText]}>
                {declineText}
              </Animated.Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: appColor,
    overflow: 'hidden',
  },
  content: {
    padding: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    paddingRight: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    minWidth: 60,
  },
  confirmButton: {
    backgroundColor: white,
  },
  declineButton: {
    borderWidth: 1,
    borderColor: white,
  },
  buttonText: {
    textAlign: 'center',
    color: appColor,
  },
  declineText: {
    color: white,
  },
});

export default ConfirmationWidget;
