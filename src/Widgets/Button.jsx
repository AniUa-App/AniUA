import {
  StyleSheet,
  Pressable,
  TouchableOpacity as RNTouchableOpacity,
} from "react-native";
import { useIsTV } from "../Styles/Responsive";
import { useThemeColors } from "../Global/useTheme";

export function TouchableOpacity(props) {
  const {
    style,
    onPress,
    onFocus,
    onBlur,
    onLongPress,
    children,
    activeOpacity,
    tvFocusable = true,
    innerRef,
    ...restProps
  } = props;
  const themeColors = useThemeColors();
  const tvMode = useIsTV();

  if (tvMode) {
    return (
      <Pressable
        ref={innerRef}
        focusable={tvFocusable}
        style={({ focused, pressed }) => [
          styles.button,
          typeof style === "function" ? style({ focused, pressed }) : style,
          pressed && styles.tvPressed,
          tvFocusable &&
            focused && {
              ...styles.tvFocused,
              borderColor: themeColors.primary,
            },
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
        onFocus={onFocus}
        onBlur={onBlur}
        {...restProps}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <RNTouchableOpacity
      ref={innerRef}
      style={[styles.button, style]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={200}
      activeOpacity={activeOpacity ?? 0.8}
      {...restProps}
    >
      {children}
    </RNTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
  },
  tvPressed: {
    opacity: 0.7,
  },
  tvFocused: {
    borderWidth: 1,
  },
});
