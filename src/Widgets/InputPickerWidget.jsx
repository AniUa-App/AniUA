import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity as RNTouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
  Keyboard,
} from "react-native";
import { useThemeColors } from "../Global/useTheme";
import { H4, H5 } from "../Styles/Fonts";
import Icons from "../Styles/Icons";
import { TouchableOpacity } from "./Button";

/**
 * Віджет вибору зі списку зі зручним багатовибором і чипами вибраних значень під полем
 *
 * Props:
 * - items: string[] | {label: string, value: string}[] — список опцій
 * - selected: string[] — початково вибрані значення (контрольований режим)
 * - onChange: (values: string[]) => void — колбек на зміну вибору
 * - placeholder: string — плейсхолдер у полі
 * - multiple: boolean — дозволити вибрати кілька значень (default: true)
 * - style: ViewStyle — контейнер віджета
 * - dropdownStyle: ViewStyle — стилі дропдауну
 * - maxDropdownHeight: number — максимальна висота блоку опцій
 * - chipStyle: ViewStyle — стилі окремого чипа
 */
export default function InputPickerWidget({
  items = [],
  selected,
  onChange = () => {},
  placeholder = "",
  multiple = true,
  style,
  dropdownStyle,
  maxDropdownHeight = 240,
  chipStyle,
}) {
  const colors = useThemeColors();
  const inputContainerRef = useRef(null);
  const inputRef = useRef(null);

  const normalizedItems = useMemo(() => {
    return (items || []).map((it) => {
      if (typeof it === "string") return { label: it, value: it };
      return { label: it?.label ?? String(it?.value ?? ""), value: it?.value };
    });
  }, [items]);

  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState(
    Array.isArray(selected) ? selected : []
  );
  const [query, setQuery] = useState("");
  const [anchor, setAnchor] = useState(null);

  // Синхронізація з контрольованим значенням
  useEffect(() => {
    if (!Array.isArray(selected)) return;
    // Оновлюємо тільки якщо значення справді змінились,
    // щоб уникнути зайвих ререндерів
    const a = internalSelected;
    const b = selected;
    if (a.length === b.length && a.every((v, i) => v === b[i])) return;
    setInternalSelected(b);
  }, [selected]);

  const isSelected = useCallback(
    (value) => internalSelected.includes(value),
    [internalSelected]
  );

  const updateSelection = useCallback(
    (value) => {
      if (!multiple) {
        const newValues = [value];
        setInternalSelected(newValues);
        onChange(newValues);
        setIsOpen(false);
        return;
      }
      const exists = internalSelected.includes(value);
      const newValues = exists
        ? internalSelected.filter((v) => v !== value)
        : [...internalSelected, value];
      setInternalSelected(newValues);
      onChange(newValues);
    },
    [internalSelected, multiple, onChange]
  );

  const removeChip = useCallback(
    (value) => {
      const newValues = internalSelected.filter((v) => v !== value);
      setInternalSelected(newValues);
      onChange(newValues);
    },
    [internalSelected, onChange]
  );

  const renderOption = useCallback(
    ({ item }) => {
      const active = isSelected(item.value);
      return (
        <TouchableOpacity
          onPress={() => {
            updateSelection(item.value);
            if (multiple) setIsOpen(true);
          }}
          activeOpacity={0.8}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 6,
            marginHorizontal: 8,
            marginVertical: 6,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={[H5, { color: colors.text }]}>{item.label}</Text>
          {active ? (
            <Icons.Check size={18} color={colors.primary} />
          ) : (
            <Icons.Plus size={18} color={colors.text} />
          )}
        </TouchableOpacity>
      );
    },
    [colors, isSelected, updateSelection, multiple]
  );

  const filteredItems = useMemo(() => {
    if (!query) return normalizedItems;
    const q = query.toLowerCase();
    return normalizedItems.filter((i) =>
      String(i.label).toLowerCase().includes(q)
    );
  }, [normalizedItems, query]);

  const measureAnchor = useCallback(() => {
    if (!inputContainerRef.current) return;
    inputContainerRef.current.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
    });
  }, []);

  return (
    <View style={[{ width: "100%" }, style]}>
      <View
        ref={inputContainerRef}
        onLayout={measureAnchor}
        style={{ position: "relative" }}
      >
        <TouchableOpacity
          onPress={() => {
            measureAnchor();
            setIsOpen(true);
          }}
          activeOpacity={0.9}
        >
          <View
            style={{
              height: 48,
              borderRadius: 16,
              backgroundColor: colors.accent,
              paddingHorizontal: 14,
              alignItems: "center",
              flexDirection: "row",
              opacity: 0.95,
            }}
          >
            <TextInput
              value={query}
              editable={false}
              pointerEvents="none"
              placeholder={placeholder}
              placeholderTextColor={colors.text}
              style={[H4, { color: colors.text, flex: 1 }]}
            />
            <Icons.CaretDown size={18} color={colors.text} />
          </View>
        </TouchableOpacity>
      </View>

      {isOpen && anchor ? (
        <Modal
          transparent
          animationType="none"
          onRequestClose={() => setIsOpen(false)}
        >
          <View style={{ flex: 1 }}>
            <Pressable
              style={StyleSheet.absoluteFillObject}
              onPress={() => {
                setIsOpen(false);
                inputRef.current?.blur?.();
                Keyboard.dismiss();
              }}
            />
            {/* Переміщуємо інпут у модальний шар, щоб не втрачати фокус */}
            <View
              style={{
                position: "absolute",
                left: anchor.x,
                top: anchor.y,
                width: anchor.width,
              }}
            >
              <View
                style={{
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: colors.subtle,
                  paddingHorizontal: 14,
                  alignItems: "center",
                  flexDirection: "row",
                  opacity: 0.95,
                }}
              >
                <TextInput
                  ref={inputRef}
                  value={query}
                  onChangeText={setQuery}
                  placeholder={placeholder}
                  placeholderTextColor={colors.text}
                  style={[H4, { color: colors.text, flex: 1 }]}
                />
                <TouchableOpacity
                  onPress={() => setIsOpen(false)}
                  activeOpacity={0.7}
                >
                  <Icons.CaretUp size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={[
                styles.dropdown,
                {
                  position: "absolute",
                  left: anchor.x,
                  top: anchor.y + 52,
                  width: anchor.width,
                  backgroundColor: colors.background,
                  borderColor: colors.subtle,
                  maxHeight: maxDropdownHeight,
                },
                dropdownStyle,
              ]}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
              >
                {filteredItems.map((item) => (
                  <View key={String(item.value)}>{renderOption({ item })}</View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      ) : null}

      {/* Чипи вибраних значень */}
      {internalSelected.length > 0 ? (
        <View style={styles.chipsContainer}>
          {internalSelected.map((value) => (
            <View
              key={value}
              style={[
                styles.chip,
                { backgroundColor: colors.primary },
                chipStyle,
              ]}
            >
              <TouchableOpacity
                onPress={() => removeChip(value)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={{ marginRight: 6 }}
              >
                <Icons.XCircle size={16} color={colors.text} />
              </TouchableOpacity>
              <Text style={[H5, { color: colors.text }]}>{value}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 6,
    zIndex: 10,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
});
