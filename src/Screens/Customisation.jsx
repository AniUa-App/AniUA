import { View, ScrollView, StatusBar, Text } from "react-native";
import { useState } from "react";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import SettingsItemWidget from "../Widgets/SettingsItemWidget";
import SettingsSection from "../Widgets/SettingsSectionWidget";
import Icons from "../Styles/Icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColors } from "../Global/useTheme";
import SettingsStorage from "../Storage/SettingsStorage";
import { EventBus } from "../Global/EventBus";
import { isTablet } from "../Styles/Responsive";
import Logger from "../Logger/Logger";
import {
  ColorPickerWidget,
  PhotoPickerWidget,
  ToggleSettingWidget,
  ExpandableSection,
} from "../Widgets/CustomisationWidgets";
import SliderWidget from "../Widgets/SliderWidget";
import { ThemedNavBar } from "./ScreenController/ScreenController";
import RNFS from "react-native-fs";
import { H6 } from "../Styles/Fonts";

export default function CustomisationScreen() {
  const navigation = useNavigation();
  const themeColors = useThemeColors();
  const _USER_CONFIG = SettingsStorage.getParameter("userConfig");
  const [USER_CONFIG, _SET_USER_CONFIG] = useState(_USER_CONFIG);

  // Expanded states for sections
  const [expandedNavbar, setExpandedNavbar] = useState(false);
  const [expandedColors, setExpandedColors] = useState(false);
  const [expandedBackground, setExpandedBackground] = useState(false);

  const SET_USER_CONFIG = (newConfig) => {
    _SET_USER_CONFIG(newConfig);
    SettingsStorage.setParameter("userConfig", newConfig);
    Logger.debug("Customisation", "Оновлення конфігурації користувача", {
      newConfig,
    });
    EventBus.emit("userConfig", newConfig);
  };

  const copyBackgroundImage = async (input) => {
    try {
      const uri = typeof input === "string" ? input : input?.uri;
      const name = typeof input === "object" ? input?.name : null;
      const mimeType = typeof input === "object" ? input?.mimeType : null;
      if (!uri) throw new Error("URI is missing");

      let extension = null;
      if (name && name.includes(".")) {
        extension = name.split(".").pop();
      }
      if (!extension && typeof uri === "string") {
        const uriParts = uri.split(".");
        if (uriParts.length > 1) {
          extension = uriParts.pop().split("?")[0];
        }
      }
      if (!extension && mimeType) {
        const mimeMap = {
          "image/png": "png",
          "image/jpeg": "jpg",
          "image/jpg": "jpg",
          "image/webp": "webp",
        };
        extension = mimeMap[mimeType] || "png";
      }
      const safeExt = extension || "png";
      const destPath = `${RNFS.DocumentDirectoryPath}/background.${safeExt}`;
      await RNFS.copyFile(uri, destPath);
      Logger.info(
        "Customisation",
        "Зображення скопійовано у внутрішню памʼять",
        { destPath }
      );
      return destPath;
    } catch (error) {
      Logger.error(
        "Customisation",
        "Помилка копіювання зображення у внутрішню памʼять",
        error
      );
      return null;
    }
  };

  return (
    <DefaultScreenWidget isCheckInternet={false} isNavBarPadding={true}>
      <ScrollView
        style={{ flex: 1, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Навігаційна панель */}
        {/* Стиль навігації - тільки для мобільних */}

        {/* Розташування панелі - тільки для планшетів */}

        {isTablet() && (
          <SettingsSection title="Навігаційна панель">
            <SettingsItemWidget
              title="Розташування панелі"
              subtitle={USER_CONFIG?.navbar?.placedAt || "Внизу"}
              icon={<Icons.List />}
              showChevron
              onPress={() => {
                navigation.navigate("HiddenStack", {
                  screen: "ButtonsScreen",
                  params: {
                    title: "Виберіть розташування панелі",
                    Sbutton: true,
                    isGoBack: true,
                    value: USER_CONFIG?.navbar?.placedAt || "Внизу",
                    list: [
                      {
                        title: "Внизу",
                        onPress: () => {
                          SET_USER_CONFIG({
                            ...USER_CONFIG,
                            navbar: {
                              ...USER_CONFIG?.navbar,
                              placedAt: "Внизу",
                              style: "MD3",
                            },
                          });
                        },
                      },
                      {
                        title: "Праворуч",
                        onPress: () => {
                          SET_USER_CONFIG({
                            ...USER_CONFIG,
                            navbar: {
                              ...USER_CONFIG?.navbar,
                              placedAt: "Праворуч",
                              style: "MD3",
                            },
                          });
                        },
                      },
                      {
                        title: "Ліворуч",
                        onPress: () => {
                          SET_USER_CONFIG({
                            ...USER_CONFIG,
                            navbar: {
                              ...USER_CONFIG?.navbar,
                              placedAt: "Ліворуч",
                              style: "MD3",
                            },
                          });
                        },
                      },
                    ],
                  },
                });
              }}
            />
          </SettingsSection>
        )}

        {/* Налаштування панелі (розгортається) */}
        {USER_CONFIG?.navbar?.isCustomisation && (
          <ExpandableSection
            title="Налаштування панелі"
            icon={<Icons.Wrench />}
            expanded={expandedNavbar}
            onToggle={() => setExpandedNavbar(!expandedNavbar)}
          >
            <SliderWidget
              label="Закруглення"
              value={USER_CONFIG?.navbar?.borderRadius ?? 8}
              min={0}
              max={50}
              onChange={(value) => {
                SET_USER_CONFIG({
                  ...USER_CONFIG,
                  navbar: {
                    ...USER_CONFIG?.navbar,
                    borderRadius: value,
                  },
                });
              }}
            />
            <SliderWidget
              label="Відступ знизу"
              value={USER_CONFIG?.navbar?.bottomOffset ?? 20}
              min={0}
              max={100}
              onChange={(value) => {
                SET_USER_CONFIG({
                  ...USER_CONFIG,
                  navbar: {
                    ...USER_CONFIG?.navbar,
                    bottomOffset: value,
                  },
                });
              }}
            />
            <SliderWidget
              label="Ширина панелі"
              value={USER_CONFIG?.navbar?.width ?? 80}
              min={50}
              max={100}
              onChange={(value) => {
                SET_USER_CONFIG({
                  ...USER_CONFIG,
                  navbar: {
                    ...USER_CONFIG?.navbar,
                    width: value,
                  },
                });
              }}
            />
            <ColorPickerWidget
              title="Колір панелі"
              icon={<Icons.PaintBucket />}
              value={
                USER_CONFIG?.navbar?.backgroundColor || themeColors.background
              }
              onValueChange={(value) => {
                SET_USER_CONFIG({
                  ...USER_CONFIG,
                  navbar: {
                    ...USER_CONFIG?.navbar,
                    backgroundColor: value.rgba,
                  },
                });
              }}
            />

            <ToggleSettingWidget
              title="Блюр панелі"
              subtitle="Заблюрення панелі навігації"
              icon={<Icons.Drop />}
              value={USER_CONFIG?.navbar?.isBlurBackground ?? false}
              onToggle={() => {
                SET_USER_CONFIG({
                  ...USER_CONFIG,
                  navbar: {
                    ...USER_CONFIG?.navbar,
                    isBlurBackground: !USER_CONFIG?.navbar?.isBlurBackground,
                  },
                });
              }}
            />

            {USER_CONFIG?.navbar?.isBlurBackground && (
              <>
                <SliderWidget
                  label="Інтенсивність блюру"
                  value={USER_CONFIG?.navbar?.blurIntensity ?? 80}
                  min={0}
                  max={100}
                  onChange={(value) => {
                    SET_USER_CONFIG({
                      ...USER_CONFIG,
                      navbar: {
                        ...USER_CONFIG?.navbar,
                        blurIntensity: value,
                      },
                    });
                  }}
                />
                <SliderWidget
                  label="Коефіцієнт зменшення"
                  value={USER_CONFIG?.navbar?.blurReductionFactor ?? 20}
                  min={0}
                  max={100}
                  onChange={(value) => {
                    SET_USER_CONFIG({
                      ...USER_CONFIG,
                      navbar: {
                        ...USER_CONFIG?.navbar,
                        blurReductionFactor: value,
                      },
                    });
                  }}
                />
              </>
            )}

            <SettingsItemWidget
              title="Скинути налаштування"
              subtitle="Відновити значення за замовчуванням"
              icon={<Icons.Trash />}
              iconColor={themeColors.redBookmark}
              showChevron
              onPress={() => {
                SET_USER_CONFIG({
                  ...USER_CONFIG,
                  navbar: { isCustomisation: true },
                });
              }}
            />
          </ExpandableSection>
        )}

        {/* Ефекти */}
        <SettingsSection title="Ефекти">
          <ToggleSettingWidget
            title="Сніжинки"
            subtitle="Падаючі сніжинки на екрані"
            icon={<Icons.Sparkle />}
            iconColor={themeColors.primary}
            value={USER_CONFIG?.effects?.snowflakes || false}
            onToggle={() => {
              SET_USER_CONFIG({
                ...USER_CONFIG,
                effects: {
                  ...USER_CONFIG?.effects,
                  snowflakes: !USER_CONFIG?.effects?.snowflakes,
                },
              });
            }}
          />
        </SettingsSection>

        {/* Кольори
        <SettingsSection title="Кольори">
          <ToggleSettingWidget
            title="Кастомні кольори"
            subtitle="Власна кольорова схема"
            icon={<Icons.PaintBucket />}
            value={USER_CONFIG?.colors?.isCustomisation || false}
            onToggle={() => {
              const newValue = !USER_CONFIG?.colors?.isCustomisation;
              SET_USER_CONFIG({
                ...USER_CONFIG,
                colors: {
                  ...USER_CONFIG?.colors,
                  isCustomisation: newValue,
                },
              });
              if (newValue) setExpandedColors(true);
            }}
          />

          {USER_CONFIG?.colors?.isCustomisation && (
            <ExpandableSection
              title="Налаштування кольорів"
              icon={<Icons.Palette />}
              expanded={expandedColors}
              onToggle={() => setExpandedColors(!expandedColors)}
            >
              <ColorPickerWidget
                title="Основний колір"
                icon={<Icons.Hexagon />}
                value={USER_CONFIG?.colors?.primary || themeColors.primary}
                onValueChange={(value) => {
                  SET_USER_CONFIG({
                    ...USER_CONFIG,
                    colors: { ...USER_CONFIG?.colors, primary: value.rgba },
                  });
                }}
              />
              <ColorPickerWidget
                title="Колір фону"
                icon={<Icons.Rectangle />}
                value={USER_CONFIG?.colors?.background || themeColors.background}
                onValueChange={(value) => {
                  SET_USER_CONFIG({
                    ...USER_CONFIG,
                    colors: { ...USER_CONFIG?.colors, background: value.rgba },
                  });
                }}
              />
              <ColorPickerWidget
                title="Допоміжний колір"
                icon={<Icons.SplitVertical />}
                value={USER_CONFIG?.colors?.subtle || themeColors.subtle}
                onValueChange={(value) => {
                  SET_USER_CONFIG({
                    ...USER_CONFIG,
                    colors: { ...USER_CONFIG?.colors, subtle: value.rgba },
                  });
                }}
              />
              <ColorPickerWidget
                title="Колір тексту"
                icon={<Icons.TextT />}
                value={USER_CONFIG?.colors?.text || themeColors.text}
                onValueChange={(value) => {
                  SET_USER_CONFIG({
                    ...USER_CONFIG,
                    colors: { ...USER_CONFIG?.colors, text: value.rgba },
                  });
                }}
              />

              <SettingsItemWidget
                title="Скинути кольори"
                subtitle="Відновити стандартні кольори"
                icon={<Icons.Trash />}
                iconColor={themeColors.redBookmark}
                showChevron
                onPress={() => {
                  SET_USER_CONFIG({
                    ...USER_CONFIG,
                    colors: { isCustomisation: true },
                  });
                }}
              />

              <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                <Text style={[H6, { color: themeColors.inActiveText, textAlign: "center" }]}>
                  Може знадобитися перезапуск додатку
                </Text>
              </View>
            </ExpandableSection>
          )}
        </SettingsSection> */}

        {/* Фон */}
        <SettingsSection title="Фон">
          <ToggleSettingWidget
            title="Кастомізація фону"
            subtitle="Налаштувати фон додатку"
            icon={<Icons.Mountains />}
            value={USER_CONFIG?.background?.isCustomisation || false}
            onToggle={() => {
              const newValue = !USER_CONFIG?.background?.isCustomisation;
              SET_USER_CONFIG({
                ...USER_CONFIG,
                background: {
                  ...USER_CONFIG?.background,
                  isCustomisation: newValue,
                },
              });
              if (newValue) setExpandedBackground(true);
            }}
          />
          {USER_CONFIG?.background?.isCustomisation && (
            <ExpandableSection
              title="Налаштування фону"
              icon={<Icons.Wrench />}
              expanded={expandedBackground}
              onToggle={() => setExpandedBackground(!expandedBackground)}
            >
              <ToggleSettingWidget
                title="Зображення на фоні"
                subtitle="Використовувати власне зображення"
                icon={<Icons.Image />}
                value={USER_CONFIG?.background?.isImageBackground || false}
                onToggle={() => {
                  SET_USER_CONFIG({
                    ...USER_CONFIG,
                    background: {
                      ...USER_CONFIG?.background,
                      isImageBackground:
                        !USER_CONFIG?.background?.isImageBackground,
                    },
                  });
                }}
              />

              {USER_CONFIG?.background?.isImageBackground && (
                <>
                  <PhotoPickerWidget
                    title="Вибрати зображення"
                    subtitle="Фонове зображення додатка"
                    icon={<Icons.Folder />}
                    onPick={async (payload) => {
                      const uriPath = await copyBackgroundImage(payload);
                      Logger.debug(
                        "Customisation",
                        "Отримано шлях до фонового зображення",
                        { uriPath }
                      );
                      SET_USER_CONFIG({
                        ...USER_CONFIG,
                        background: {
                          ...USER_CONFIG?.background,
                          image: uriPath,
                        },
                      });
                    }}
                  />
                  <SliderWidget
                    label="Прозорість фону"
                    value={USER_CONFIG?.background?.opacity ?? 100}
                    min={0}
                    max={100}
                    onChange={(value) => {
                      SET_USER_CONFIG({
                        ...USER_CONFIG,
                        background: {
                          ...USER_CONFIG?.background,
                          opacity: value,
                        },
                      });
                    }}
                    style={{ width: "95%", alignSelf: "center" }}
                  />
                </>
              )}

              <ToggleSettingWidget
                title="Блюр фону"
                subtitle="Заблюрення фонового зображення"
                icon={<Icons.Drop />}
                value={USER_CONFIG?.background?.isBlurBackground || false}
                onToggle={() => {
                  SET_USER_CONFIG({
                    ...USER_CONFIG,
                    background: {
                      ...USER_CONFIG?.background,
                      isBlurBackground:
                        !USER_CONFIG?.background?.isBlurBackground,
                    },
                  });
                }}
              />

              {USER_CONFIG?.background?.isBlurBackground && (
                <>
                  <SliderWidget
                    label="Інтенсивність блюру"
                    value={USER_CONFIG?.background?.blurIntensity ?? 80}
                    min={0}
                    max={100}
                    onChange={(value) => {
                      SET_USER_CONFIG({
                        ...USER_CONFIG,
                        background: {
                          ...USER_CONFIG?.background,
                          blurIntensity: value,
                        },
                      });
                    }}
                  />
                  <SliderWidget
                    label="Коефіцієнт зменшення"
                    value={USER_CONFIG?.background?.blurReductionFactor ?? 20}
                    min={0}
                    max={20}
                    onChange={(value) => {
                      SET_USER_CONFIG({
                        ...USER_CONFIG,
                        background: {
                          ...USER_CONFIG?.background,
                          blurReductionFactor: value,
                        },
                      });
                    }}
                  />
                </>
              )}
            </ExpandableSection>
          )}
        </SettingsSection>

        {/* Головний екран */}
        <SettingsSection title="Головний екран">
          <SettingsItemWidget
            title="Налаштування головного екрану"
            subtitle="Віджети та порядок відображення"
            icon={<Icons.House />}
            showChevron
            onPress={() => {
              navigation.navigate("HiddenStack", {
                screen: "MainScreenCustomisation",
                params: {
                  userConfig: USER_CONFIG,
                },
              });
            }}
          />
        </SettingsSection>

        {/* Прев'ю навбару */}
        {USER_CONFIG?.navbar?.isCustomisation && (
          <View style={{ height: 120 }} />
        )}

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* Прев'ю кастомної навігаційної панелі */}
      {USER_CONFIG?.navbar?.isCustomisation && (
        <View
          style={{
            width: "100%",
            height: 100,
            alignSelf: "center",
            backgroundColor: "transparent",
            position: "absolute",
            left: 0,
            right: 0,
            zIndex: 9999,
            marginBottom: 20,
            bottom: 0,
          }}
        >
          <ThemedNavBar
            isPreview={true}
            state={{
              history: [{ key: "", type: "route" }],
              index: 0,
              preloadedRouteKeys: [],
              routes: [
                { key: "Home", name: "Home", params: undefined },
                { key: "Liked", name: "Liked", params: undefined },
                { key: "Download", name: "Download", params: undefined },
                { key: "Settings", name: "Settings", params: undefined },
                { key: "AnimeList", name: "AnimeList", params: undefined },
              ],
            }}
          />
        </View>
      )}
    </DefaultScreenWidget>
  );
}
