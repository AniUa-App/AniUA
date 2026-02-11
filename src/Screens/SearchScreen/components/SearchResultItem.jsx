import { useCallback } from "react";
import { Linking } from "react-native";
import { useThemeColors } from "../../../Global/useTheme";
import Icons from "../../../Styles/Icons";
import AnimePreviewWidget from "../../../Widgets/AnimePreviewWidget";
import DubComponent from "../../../Components/DubComponent";
import CharacterComponent from "../../../Components/CharacterComponen";

export function SearchResultItem({
  item,
  activeCategory,
  onTeamPress,
  onCharacterPress,
  onFocus,
}) {
  const themeColors = useThemeColors();

  const handleTeamTelegramPress = useCallback(() => {
    Linking.openURL(item?.telegram || item?.tg);
  }, [item]);

  const handleTeamBodyPress = useCallback(() => {
    if (item?.is_verified) {
      onTeamPress?.(item);
    }
  }, [item, onTeamPress]);

  switch (activeCategory) {
    case "anime":
      return (
        <AnimePreviewWidget
          anime={item}
          info={{}}
          updateInfo={() => {}}
          type="Search"
          onFocus={onFocus}
        />
      );

    case "character":
      return <CharacterComponent item={item} onPress={onCharacterPress} onFocus={onFocus} />;

    case "team":
      return (
        <DubComponent
          logo={item?.logo}
          name={item?.name}
          subtitle={`${item?.status} ${item?.is_verified ? "• " + (item?.releases?.length || 0) + " релізів" : ""}`}
          isPartner={item?.is_verified}
          onBodyClick={handleTeamBodyPress}
          onButtonClick={handleTeamTelegramPress}
          icon={<Icons.TelegramLogo size={32} color={themeColors.text} />}
          onFocus={onFocus}
        />
      );

    default:
      return null;
  }
}
