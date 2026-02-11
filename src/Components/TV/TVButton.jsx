import React, { useState } from "react";
import { TouchableOpacity } from "../../Widgets/Button";
import { TV } from "../../Styles/TVStyles";
import { background } from "../../Styles/Colors";

const defaultFocusStyle = {};

export default function TVButton({
  style,
  focusedStyle,
  children,
  onFocus,
  onBlur,
  hasTVPreferredFocus = false,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TouchableOpacity
      {...props}
      style={[style, isFocused && (focusedStyle || defaultFocusStyle)]}
      onFocus={(e) => {
        setIsFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        onBlur?.(e);
      }}
      hasTVPreferredFocus={hasTVPreferredFocus}
    >
      {children}
    </TouchableOpacity>
  );
}
