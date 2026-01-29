import React, { forwardRef, useCallback, useState } from "react";
import { StyleProp, ViewStyle } from "react-native";

/**
 * Formatting menu items configuration
 */
const FORMATTING_MENU_ITEMS = [
  { id: "bold", title: "Жирний" },
  { id: "italic", title: "Курсив" },
  { id: "spoiler", title: "Спойлер" },
  { id: "quote", title: "Цитата" },
];

/**
 * Format wrappers for each menu item
 */
const FORMAT_WRAPPERS: Record<string, { prefix: string; suffix: string }> = {
  bold: { prefix: "**", suffix: "**" },
  italic: { prefix: "*", suffix: "*" },
  spoiler: { prefix: "::: spoiler\n", suffix: "\n:::" },
  quote: { prefix: "> ", suffix: "" },
};

interface FormattableTextInputProps {
  /**
   * Current text value
   */
  value?: string;

  /**
   * Called when text changes
   */
  onChangeText?: (text: string) => void;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Placeholder text color
   */
  placeholderTextColor?: string;

  /**
   * Text color
   */
  textColor?: string;

  /**
   * Font size
   */
  fontSize?: number;

  /**
   * Maximum text length
   */
  maxLength?: number;

  /**
   * Whether input is editable
   */
  editable?: boolean;

  /**
   * Style object
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Custom menu items (optional, uses default formatting if not provided)
   */
  menuItems?: Array<{ id: string; title: string }>;

  /**
   * Custom handler for menu item press (optional)
   * If not provided, default formatting behavior is used
   */
  onMenuItemPress?: (
    itemId: string,
    selectedText: string,
    selectionStart: number,
    selectionEnd: number
  ) => void;
}

/**
 * FormattableTextInput - Text input with context menu for text formatting
 *
 * Features:
 * - Native Android context menu with formatting options
 * - Bold (**text**)
 * - Italic (*text*)
 * - Spoiler (::: spoiler\ntext\n:::)
 * - Quote (> text)
 *
 * Usage:
 * ```tsx
 * <FormattableTextInput
 *   value={text}
 *   onChangeText={setText}
 *   placeholder="Enter text..."
 * />
 * ```
 */
const FormattableTextInput = forwardRef<any, FormattableTextInputProps>(
  (
    {
      value = "",
      onChangeText,
      placeholder,
      placeholderTextColor,
      textColor,
      fontSize = 15,
      maxLength = 2000,
      editable = true,
      style,
      menuItems = FORMATTING_MENU_ITEMS,
      onMenuItemPress,
    },
    ref
  ) => {
    const [internalText, setInternalText] = useState(value);

    // Sync internal state with external value
    const currentText = value !== undefined ? value : internalText;

    const handleTextChange = useCallback(
      (text: string) => {
        setInternalText(text);
        onChangeText?.(text);
      },
      [onChangeText]
    );

    const handleMenuItemPress = useCallback(
      (
        itemId: string,
        selectedText: string,
        selectionStart: number,
        selectionEnd: number
      ) => {
        // If custom handler provided, use it
        if (onMenuItemPress) {
          onMenuItemPress(itemId, selectedText, selectionStart, selectionEnd);
          return;
        }

        // Default formatting behavior
        const wrapper = FORMAT_WRAPPERS[itemId];
        if (!wrapper) return;

        const { prefix, suffix } = wrapper;
        const formattedText = prefix + selectedText + suffix;

        const newText =
          currentText.substring(0, selectionStart) +
          formattedText +
          currentText.substring(selectionEnd);

        handleTextChange(newText);
      },
      [currentText, handleTextChange, onMenuItemPress]
    );

    return (
      <SelectionMenuInput
        ref={ref}
        text={currentText}
        onTextChange={handleTextChange}
        menuItems={menuItems}
        onMenuItemPress={handleMenuItemPress}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        textColor={textColor}
        fontSize={fontSize}
        maxLength={maxLength}
        editable={editable}
        style={style}
      />
    );
  }
);

FormattableTextInput.displayName = "FormattableTextInput";

export default FormattableTextInput;

/**
 * Export formatting constants for external use
 */
export { FORMATTING_MENU_ITEMS, FORMAT_WRAPPERS };
