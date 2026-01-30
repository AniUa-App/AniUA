import { View, Text, StyleSheet } from "react-native";
import { memo, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown, FadeOut, Layout } from "react-native-reanimated";
import { Swipeable } from "react-native-gesture-handler";
import { useThemeColors } from "../Global/useTheme";
import { H6, H7 } from "../Styles/Fonts";
import { Image } from "../Widgets/LoadersWidgets";
import { TouchableOpacity } from "../Widgets/Button";
import { prefetchBloomImage } from "../Widgets/BloomImage";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import Icons from "../Styles/Icons";
import { format, formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";

/**
 * Форматує час отримання сповіщення
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Відформатований час
 */
function formatNotificationTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffHours = (now - date) / (1000 * 60 * 60);

  if (diffHours < 24) {
    return formatDistanceToNow(date, { addSuffix: true, locale: uk });
  } else if (diffHours < 48) {
    return `Вчора о ${format(date, "HH:mm", { locale: uk })}`;
  } else {
    return format(date, "d MMM HH:mm", { locale: uk });
  }
}

/**
 * Компонент картки сповіщення з постером аніме
 * @param {Object} item - Об'єкт сповіщення
 * @param {function} onPress - Callback при натисканні
 * @param {function} onDelete - Callback при видаленні (свайп)
 */
const NotificationCard = memo(function NotificationCard({
  item,
  onPress,
  onDelete,
  navigation: propNavigation,
}) {
  const navigation = propNavigation || useNavigation();
  const themeColors = useThemeColors();
  const [animeDetails, setAnimeDetails] = useState(null);

  // Підвантажуємо деталі аніме якщо є slug
  useEffect(() => {
    if (item.data?.slug) {
      HikkaApiComplete.getAnimeDetails(item.data.slug).then((data) => {
        if (data) setAnimeDetails(data);
      });
    }
  }, [item.data?.slug]);

  const posterImage = animeDetails?.image || item.data?.image;
  const animeTitle =
    animeDetails?.title_ua ||
    animeDetails?.title_en ||
    animeDetails?.title_ja ||
    item.title;

  const handlePress = () => {
    if (onPress) {
      onPress(item);
    } else if (item.data?.slug) {
      prefetchBloomImage(posterImage);
      navigation.navigate("HiddenStack", {
        screen: "AnimePreview",
        params: { slug: item.data.slug },
      });
    }
  };

  const renderRightActions = () => {
    return (
      <View style={[styles.deleteAction, {}]}>
        <Icons.Trash size={24} color="#fff" />
      </View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      onSwipeableOpen={() => onDelete?.(item.id)}
      rightThreshold={80}
    >
      <Animated.View
        entering={FadeInDown.duration(300)}
        exiting={FadeOut.duration(200)}
        layout={Layout.springify()}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.container,
            {
              backgroundColor: item.read
                ? themeColors.background
                : themeColors.Primary(0.6),
            },
          ]}
          onPress={handlePress}
        >
          {/* Постер аніме */}
          {posterImage ? (
            <Image uri={posterImage} style={styles.poster} />
          ) : (
            <View
              style={[
                styles.poster,
                styles.posterPlaceholder,
                { backgroundColor: themeColors.accent },
              ]}
            >
              <Icons.FilmSlate size={32} color={themeColors.icon} />3
            </View>
          )}

          {/* Інформація про сповіщення */}
          <View style={styles.content}>
            {/* Заголовок (назва аніме або title сповіщення) */}
            <Text
              selectable={true}
              selectable={true}
              style={[
                styles.title,
                {
                  color: themeColors.text,
                  fontWeight: item.read ? "normal" : "600",
                },
              ]}
              numberOfLines={2}
            >
              {animeTitle}
            </Text>

            {/* Тіло сповіщення (інфо про серію) */}
            {item.body ? (
              <Text
                selectable={true}
                style={[styles.body, { color: themeColors.primary }]}
                numberOfLines={1}
              >
                {item.body}
              </Text>
            ) : null}

            {/* Команда озвучення */}
            {item.data?.team && (
              <View style={styles.teamRow}>
                <Icons.Microphone size={14} color={themeColors.Text(0.5)} />
                <Text
                  selectable={true}
                  style={[styles.team, { color: themeColors.Text(0.6) }]}
                  numberOfLines={1}
                >
                  {item.data.team}
                </Text>
              </View>
            )}

            {/* Час отримання */}
            <Text
              selectable={true}
              style={[styles.time, { color: themeColors.Text(0.5) }]}
            >
              {formatNotificationTime(item.receivedAt)}
            </Text>
          </View>

          {/* Індикатор непрочитаного */}
          {!item.read && (
            <View
              style={[
                styles.unreadDot,
                { backgroundColor: themeColors.primary },
              ]}
            />
          )}
        </TouchableOpacity>
      </Animated.View>
    </Swipeable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  poster: {
    width: 70,
    height: 100,
    borderRadius: 12,
  },
  posterPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  title: {
    fontFamily: "Nunito-SemiBold",
    fontSize: H6.fontSize,
    lineHeight: 18,
    marginBottom: 4,
  },
  body: {
    fontFamily: "Nunito-Medium",
    fontSize: H7.fontSize,
    marginBottom: 4,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  team: {
    fontFamily: "Nunito-Regular",
    fontSize: H7.fontSize,
  },
  time: {
    fontFamily: "Nunito-Regular",
    fontSize: H7.fontSize,
  },
  unreadDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deleteAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
    borderRadius: 16,
    marginBottom: 10,
  },
});

export default NotificationCard;
