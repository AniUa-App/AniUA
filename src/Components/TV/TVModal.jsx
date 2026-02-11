import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  Modal,
  View,
  ScrollView,
  StyleSheet,
  BackHandler,
  Pressable,
} from "react-native";
import { Text } from "../../Styles/Fonts";
import { useThemeColors } from "../../Global/useTheme";
import { TV } from "../../Styles/TVStyles";
import { useEffect } from "react";

const TVModal = forwardRef(function TVModal({ title, children, onClose }, ref) {
  const [visible, setVisible] = useState(false);
  const themeColors = useThemeColors();

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
        style={styles.backdrop}
        onPress={() => {
          setVisible(false);
          onClose?.();
        }}
      >
        <Pressable
          style={[
            styles.container,
            { backgroundColor: themeColors.background },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {title && (
            <Text
              style={[
                styles.title,
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
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "50%",
    maxHeight: "80%",
    borderRadius: TV.button.borderRadius,
    padding: TV.padding.section,
    elevation: 10,
  },
  title: {
    fontFamily: "Nunito-SemiBold",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
  },
});

export default TVModal;
