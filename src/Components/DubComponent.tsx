import {
  View,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import FastImage from "react-native-fast-image";
import { TouchableOpacity } from "../Widgets/Button";
import Icons from "../Styles/Icons";
import { H5, H6 } from "../Styles/Fonts";
import { useThemeColors } from "../Global/useTheme";
import { useDubComponentStyles } from "../Styles/components/DubComponentStyles";

interface DubComponentProps {
  logo?: string;
  name: string;
  subtitle?: string;
  icon: React.ReactNode | void;
  isPartner?: boolean;
  onBodyClick?: (name: string) => void;
  onButtonClick?: (name: string) => void;
  style?: StyleProp<ViewStyle> | StyleProp<TextStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  checkColor?: string;
  onFocus?: () => void;
  innerRef?: React.Ref<any>;
  nextFocusDown?: number;
  nextFocusUp?: number;
}

export default function DubComponent({
  logo,
  name,
  subtitle,
  icon,
  isPartner,
  onBodyClick,
  onButtonClick,
  style,
  buttonStyle,
  subtitleStyle,
  checkColor,
  onFocus,
  innerRef,
  nextFocusDown,
  nextFocusUp,
}: DubComponentProps) {
  const themeColors = useThemeColors();
  const s = useDubComponentStyles();

  return (
    <TouchableOpacity
      innerRef={innerRef}
      nextFocusDown={nextFocusDown}
      nextFocusUp={nextFocusUp}
      style={[
        s.resultItem,
        { backgroundColor: themeColors.background },
        style,
      ]}
      onPress={() => {
        onBodyClick(name);
      }}
      onFocus={onFocus}
    >
      <View
        style={[
          s.resultImageContainer,
          { backgroundColor: themeColors.subtle },
        ]}
      >
        {logo ? (
          <FastImage
            source={{ uri: logo }}
            style={s.resultImage}
            resizeMode="cover"
          />
        ) : (
          <Icons.Image size={40} color={themeColors.text} weight="regular" />
        )}
      </View>
      <View style={s.resultInfo}>
        <View style={{ flexDirection: "row", gap: 4 }}>
          <Text
            style={[H5, { color: themeColors.text }, style]}
            numberOfLines={2}
          >
            {name}
          </Text>
          {isPartner && (
            <Icons.CheckCircle
              size={22}
              color={checkColor || themeColors.primary}
            />
          )}
        </View>

        <Text
          style={[
            H6,
            {
              color: themeColors.primary,
            },
            subtitleStyle,
          ]}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>
      {isPartner && (
        <TouchableOpacity
          style={[
            {
              backgroundColor: themeColors.primary,
              padding: 6,
              borderRadius: 8,
            },
            buttonStyle,
          ]}
          onPress={() => onButtonClick(name)}
        >
          {icon}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

