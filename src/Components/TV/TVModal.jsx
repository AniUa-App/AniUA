import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  Modal,
  View,
  ScrollView,
  BackHandler,
  Pressable,
} from "react-native";
import { Text } from "../../Styles/Fonts";
import { useThemeColors } from "../../Global/useTheme";
import { TV } from "../../Styles/TVStyles";
import { useEffect } from "react";
import { useTVModalStyles } from "../../Styles/components/TV/TVModalStyles";

const TVModal = forwardRef(function TVModal({ title, children, onClose }, ref) {
  const [visible, setVisible] = useState(false);
  const themeColors = useThemeColors();
  const s = useTVModalStyles();

  useImperativeHandle(ref, () => ({
    present: () => setVisible(true),
    open: () => setVisible(true),
    dismiss: () => setVisible(false),
    close: () => setVisible(false),
  }));

  useEffect(() => {
    if (!visible) return;

    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      setVisible(false);
      onClose?.();
      return true;
    });

    return () => handler.remove();
  }, [visible, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        setVisible(false);
        onClose?.();
      }}
    >
      <Pressable
        style={s.backdrop}
        onPress={() => {
          setVisible(false);
          onClose?.();
        }}
      >
        <Pressable
          style={[
            s.container,
            { backgroundColor: themeColors.background },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {title && (
            <Text
              style={[
                s.title,
                {
                  color: themeColors.text,
                  borderBottomColor: themeColors.subtle,
                },
              ]}
            >
              {title}
            </Text>
          )}
          <ScrollView
            style={s.content}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
});


export default TVModal;
