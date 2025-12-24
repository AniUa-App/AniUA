import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import FastImage from "react-native-fast-image";
import { TouchableOpacity } from "../Widgets/Button";
import Icons from "../Styles/Icons";
import { H5, H6 } from "../Styles/Fonts";
import { useThemeColors } from "../Global/useTheme";

interface DubComponentProps {
  logo?: string;
  name: string;
  subtitle?: string;
  icon: React.ReactNode;
  isPartner?: boolean;
  onBodyClick?: (name: string) => void;
  onButtonClick?: (name: string) => void;
  style?: StyleProp<ViewStyle>;
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
}: DubComponentProps) {
  const themeColors = useThemeColors();

  return (
    <TouchableOpacity
      style={[
        styles.resultItem,
        { backgroundColor: themeColors.background },
        style,
      ]}
      onPress={() => {
        onBodyClick(name);
      }}
    >
      <View
        style={[
          styles.resultImageContainer,
          { backgroundColor: themeColors.subtle },
        ]}
      >
        {logo ? (
          <FastImage
            source={{ uri: logo }}
            style={styles.resultImage}
            resizeMode="cover"
          />
        ) : (
          <Icons.Image size={40} color={themeColors.text} weight="regular" />
        )}
      </View>
      <View style={styles.resultInfo}>
        <View style={{ flexDirection: "row", gap: 4 }}>
          <Text style={[H5, { color: themeColors.text }]} numberOfLines={2}>
            {name}
          </Text>
          {isPartner && (
            <Icons.CheckCircle size={22} color={themeColors.primary} />
          )}
        </View>

        <Text
          style={[
            H6,
            {
              color: themeColors.primary,
            },
          ]}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: themeColors.primary,
          padding: 6,
          borderRadius: 8,
        }}
        onPress={() => onButtonClick(name)}
      >
        {icon}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingHorizontal: 12,
    margin: 4,
    borderRadius: 18,
    marginBottom: 8,
  },
  resultImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  resultImage: {
    width: "100%",
    height: "100%",
  },
  resultInfo: {
    flex: 1,
    marginRight: 8,
  },
});
