import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import SettingsStorage from "../Storage/SettingsStorage";
import {
  appColor,
  black,
  White,
  white,
  Black,
  Black_1,
  black_1,
  gray,
} from "../Styles/Colors";
import { useThemeColors } from "../Global/useTheme";
import { ScrollView } from "react-native-gesture-handler";
import { H2, H3, H4, H5, H6 } from "../Styles/Fonts";
import SettingsItemWidget from "../Widgets/SettingsItemWidget";
import Icons from "../Styles/Icons";
import Slider from "@react-native-community/slider"; // Потрібно встановити цей пакет
import {
  CustomNavBar,
  ThemedNavBar,
} from "./ScreenController/ScreenController";
import { EventBus } from "../Global/EventBus";
import ColorPicker, {
  Panel1,
  Swatches,
  Preview,
  OpacitySlider,
  HueSlider,
  colorKit,
  PreviewText,
} from "reanimated-color-picker";
import { runOnJS } from "react-native-reanimated";
import * as DocumentPicker from "expo-document-picker";
import RNFS from "react-native-fs";
import { useNavigation } from "@react-navigation/native";
import { SegmentedControlLabelWidget } from "../Widgets/Buttons";

export default function СustomisationScreen() {
  const navigation = useNavigation();
  const themeColors = useThemeColors();
  const _USER_CONFIG = SettingsStorage.getParameter("userConfig");
  const MAIN_SCREEN_CONFIG = SettingsStorage.getParameter("mainScreenConfig");
  const [USER_CONFIG, _SET_USER_CONFIG] = useState(_USER_CONFIG);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  // Значення для слайдерів (можна розширити для декількох)
  const [sliderValue, setSliderValue] = useState(
    USER_CONFIG?.navbar?.blurIntensity ?? 80
  );

  // Анімаційні значення для кожного елемента
  const animatedValues = useRef({});

  const SET_USER_CONFIG = (newConfig) => {
    _SET_USER_CONFIG(newConfig);
    SettingsStorage.setParameter("userConfig", newConfig);
    console.log(newConfig, "newConfig");
    EventBus.emit("userConfig", newConfig);
  };

  // Функція для керування анімацією
  const toggleExpanded = (itemKey) => {
    const isExpanded = expandedItems[itemKey];

    if (!animatedValues.current[itemKey]) {
      animatedValues.current[itemKey] = new Animated.Value(0);
    }

    if (isExpanded) {
      // Анімація приховування
      Animated.timing(animatedValues.current[itemKey], {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      // Анімація показу
      Animated.timing(animatedValues.current[itemKey], {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }

    setExpandedItems((prev) => ({
      ...prev,
      [itemKey]: !isExpanded,
    }));
  };

  // Явне відкриття/закриття секції з анімацією
  const setExpandedState = (itemKey, shouldExpand) => {
    if (!animatedValues.current[itemKey]) {
      animatedValues.current[itemKey] = new Animated.Value(
        shouldExpand ? 1 : 0
      );
    }

    Animated.timing(animatedValues.current[itemKey], {
      toValue: shouldExpand ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setExpandedItems((prev) => ({
      ...prev,
      [itemKey]: shouldExpand,
    }));
  };

  const CUSTOMISATION_SETTINGS_V1 = [
    {
      slug: "navbar",
      body: [
        {
          title: "Стиль навігаційної панелі",
          description: ``,
          value: USER_CONFIG?.navbar?.style || "default",
          button: <Icons.CaretDown size={34} color={white} />,
          onPress: () => {},
          body: () => {
            return (
              <View
                style={[
                  styles.bsContainer,
                  {
                    width: "100%",
                  },
                ]}
              >
                <SegmentedControlLabelWidget
                  segments={[{ label: "Default" }, { label: "MD3" }]}
                  value={USER_CONFIG?.navbar?.style || "Default"}
                  onChange={(value) => {
                    console.log(value, "value");
                    SET_USER_CONFIG({
                      ...USER_CONFIG,
                      navbar: {
                        ...USER_CONFIG?.navbar,
                        style: value,
                      },
                    });
                  }}
                />
              </View>
            );
          },
        },
      ],
    },
    {
      slug: "navbar",
      body: [
        {
          title: "Кастомізація навігаційної панелі",
          description: ``,
          value: USER_CONFIG?.navbar?.isCustomisation || false,
          button: USER_CONFIG?.navbar?.isCustomisation ? (
            <Icons.ToggleRight size={34} color={white} />
          ) : (
            <Icons.ToggleLeft size={34} color={black} />
          ),
          onPress: () => {
            SET_USER_CONFIG({
              ...USER_CONFIG,
              navbar: {
                ...USER_CONFIG?.navbar,
                isCustomisation: !USER_CONFIG?.navbar?.isCustomisation,
              },
            });
          },
          body: ({}) => (
            <>
              <ScrollView style={styles.bsContainer}>
                <SliderWidget
                  title="Закруглення панелі"
                  value={USER_CONFIG?.navbar?.borderRadius ?? 8}
                  minimumValue={0}
                  maximumValue={100}
                  onValueChange={(value) => {
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
                  title="Відступ панелі"
                  value={USER_CONFIG?.navbar?.bottomOffset ?? 20}
                  minimumValue={0}
                  maximumValue={1000}
                  onValueChange={(value) => {
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
                  title="Ширина панелі"
                  value={USER_CONFIG?.navbar?.width ?? 80}
                  minimumValue={0}
                  maximumValue={100}
                  onValueChange={(value) => {
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
                  value={USER_CONFIG?.navbar?.backgroundColor || black}
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
                <SettingsItemWidget
                  title="Блюр панелі"
                  subtitle="Заблюрення панелі навігації"
                  onPress={() => {
                    SET_USER_CONFIG({
                      ...USER_CONFIG,
                      navbar: {
                        ...USER_CONFIG?.navbar,
                        isBlurBackground: !(
                          USER_CONFIG?.navbar?.isBlurBackground ?? false
                        ),
                      },
                    });
                  }}
                  button={{
                    Icon: USER_CONFIG?.navbar?.isBlurBackground ? (
                      <Icons.ToggleRight size={34} color={white} />
                    ) : (
                      <Icons.ToggleLeft size={34} color={black} />
                    ),
                  }}
                />
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    alignSelf: "center",
                    paddingTop: 10,
                  }}
                >
                  {USER_CONFIG?.navbar?.isBlurBackground && (
                    <>
                      <SliderWidget
                        title="Заблюрення панелі"
                        onValueChange={(value) => {
                          SET_USER_CONFIG({
                            ...USER_CONFIG,
                            navbar: {
                              ...USER_CONFIG?.navbar,
                              blurIntensity: value,
                            },
                          });
                        }}
                        value={USER_CONFIG?.navbar?.blurIntensity ?? 80}
                        minimumValue={0}
                        maximumValue={100}
                      />
                      <SliderWidget
                        title="Коефіцієнт зменшення розмиття"
                        onValueChange={(value) => {
                          SET_USER_CONFIG({
                            ...USER_CONFIG,
                            navbar: {
                              ...USER_CONFIG?.navbar,
                              blurReductionFactor: value,
                            },
                          });
                        }}
                        value={USER_CONFIG?.navbar?.blurReductionFactor ?? 20}
                        minimumValue={0}
                        maximumValue={100}
                      />
                    </>
                  )}
                  <SettingsItemWidget
                    title="Скинути налаштування"
                    button={{
                      Icon: <Icons.ArrowsClockwise size={34} color={white} />,
                    }}
                    onPress={() => {
                      SET_USER_CONFIG({
                        ...USER_CONFIG,
                        navbar: { isCustomisation: true },
                      });
                    }}
                  />
                </View>
              </ScrollView>
            </>
          ),
          // onPressBody: ({ item }) => {
          //   setSelectedItem(item);
          // },
        },
      ],
    },
    {
      slug: "colors",
      body: [
        {
          title: "Кастомні кольори",
          description: ``,
          value: USER_CONFIG?.colors?.isCustomisation || false,
          button: USER_CONFIG?.colors?.isCustomisation ? (
            <Icons.ToggleRight size={34} color={white} />
          ) : (
            <Icons.ToggleLeft size={34} color={black} />
          ),
          onPress: () => {
            SET_USER_CONFIG({
              ...USER_CONFIG,
              colors: {
                ...USER_CONFIG?.colors,
                isCustomisation: !USER_CONFIG?.colors?.isCustomisation,
              },
            });
          },
          body: ({}) => {
            return (
              <ScrollView style={styles.bsContainer}>
                <ColorPickerWidget
                  title="Основний колір додатка"
                  value={USER_CONFIG?.colors?.appColor || themeColors.appColor}
                  onValueChange={(value) => {
                    SET_USER_CONFIG({
                      ...USER_CONFIG,
                      colors: { ...USER_CONFIG?.colors, appColor: value.rgba },
                    });
                  }}
                />
                <ColorPickerWidget
                  title="Колір для фону"
                  value={USER_CONFIG?.colors?.black || themeColors.black}
                  onValueChange={(value) => {
                    SET_USER_CONFIG({
                      ...USER_CONFIG,
                      colors: { ...USER_CONFIG?.colors, black: value.rgba },
                    });
                  }}
                />
                <ColorPickerWidget
                  title="Допоміжний колір"
                  value={USER_CONFIG?.colors?.black_1 || themeColors.black_1}
                  onValueChange={(value) => {
                    SET_USER_CONFIG({
                      ...USER_CONFIG,
                      colors: { ...USER_CONFIG?.colors, black_1: value.rgba },
                    });
                  }}
                />
                <ColorPickerWidget
                  title="Колір для тексту"
                  value={USER_CONFIG?.colors?.white || themeColors.white}
                  onValueChange={(value) => {
                    SET_USER_CONFIG({
                      ...USER_CONFIG,
                      colors: { ...USER_CONFIG?.colors, white: value.rgba },
                    });
                  }}
                />
                <SettingsItemWidget
                  title="Скинути налаштування"
                  onPress={() => {
                    SET_USER_CONFIG({
                      ...USER_CONFIG,
                      colors: {
                        isCustomisation: true,
                      },
                    });
                  }}
                  button={{
                    Icon: <Icons.ArrowsClockwise size={34} color={white} />,
                  }}
                />
                <Text
                  style={[
                    H6,
                    { padding: 20, textAlign: "center", color: gray },
                  ]}
                >
                  Можливо буде потрібно перезапуск додатку
                </Text>
              </ScrollView>
            );
          },
        },
      ],
    },
    {
      slug: "background",
      body: [
        {
          title: "Кастомізація фону",
          description: ``,
          value: USER_CONFIG?.background?.isCustomisation || false,
          button: USER_CONFIG?.background?.isCustomisation ? (
            <Icons.ToggleRight size={34} color={white} />
          ) : (
            <Icons.ToggleLeft size={34} color={black} />
          ),
          onPress: () => {
            SET_USER_CONFIG({
              ...USER_CONFIG,
              background: {
                ...USER_CONFIG?.background,
                isCustomisation: !USER_CONFIG?.background?.isCustomisation,
              },
            });
          },
          body: ({}) => {
            const copyBackgroundImage = async (input) => {
              try {
                const uri = typeof input === "string" ? input : input?.uri;
                const name = typeof input === "object" ? input?.name : null;
                const mimeType = typeof input === "object" ? input?.mimeType : null;
                if (!uri) throw new Error("URI is missing");

                // Try to determine extension from name, URI or mimeType
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
                console.log(
                  "Зображення скопійовано у внутрішню памʼять:",
                  destPath
                );
                return destPath;
              } catch (error) {
                console.error(
                  "Помилка копіювання зображення у внутрішню памʼять:",
                  error
                );
                return null;
              }
            };
            return (
              <ScrollView style={styles.bsContainer}>
                <SettingsItemWidget
                  title="Зображення на фоні"
                  subtitle="Фонове зображення додатка"
                  onPress={() => {
                    SET_USER_CONFIG({
                      ...USER_CONFIG,
                      background: {
                        ...USER_CONFIG?.background,
                        isImageBackground: !(
                          USER_CONFIG?.background?.isImageBackground ?? false
                        ),
                      },
                    });
                  }}
                  button={{
                    Icon: USER_CONFIG?.background?.isImageBackground ? (
                      <Icons.ToggleRight size={34} color={white} />
                    ) : (
                      <Icons.ToggleLeft size={34} color={black} />
                    ),
                  }}
                />
                {USER_CONFIG?.background?.isImageBackground && (
                  <View style={{ marginTop: 20 }}>
                    <PhotoPickerWidget
                      title="Фонове зображення"
                      subtitle="Фонове зображення додатка"
                      onPick={async (payload) => {
                        const uriPath = await copyBackgroundImage(payload);
                        console.log(uriPath, "uriPath");
                        SET_USER_CONFIG({
                          ...USER_CONFIG,
                          background: {
                            ...USER_CONFIG?.background,
                            image: uriPath,
                          },
                        });
                      }}
                    />
                  </View>
                )}
                <SettingsItemWidget
                  title="Блюр фону"
                  subtitle="Заблюрення фонового зображення"
                  onPress={() => {
                    SET_USER_CONFIG({
                      ...USER_CONFIG,
                      background: {
                        ...USER_CONFIG?.background,
                        isBlurBackground: !(
                          USER_CONFIG?.background?.isBlurBackground ?? false
                        ),
                      },
                    });
                  }}
                  button={{
                    Icon: USER_CONFIG?.background?.isBlurBackground ? (
                      <Icons.ToggleRight size={34} color={white} />
                    ) : (
                      <Icons.ToggleLeft size={34} color={black} />
                    ),
                  }}
                />
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    alignSelf: "center",
                    paddingTop: 10,
                  }}
                >
                  {USER_CONFIG?.background?.isBlurBackground && (
                    <>
                      <SliderWidget
                        title="Заблюрення панелі"
                        onValueChange={(value) => {
                          SET_USER_CONFIG({
                            ...USER_CONFIG,
                            background: {
                              ...USER_CONFIG?.background,
                              blurIntensity: value,
                            },
                          });
                        }}
                        value={USER_CONFIG?.background?.blurIntensity ?? 80}
                        minimumValue={0}
                        maximumValue={100}
                      />
                      <SliderWidget
                        title="Коефіцієнт зменшення розмиття"
                        onValueChange={(value) => {
                          SET_USER_CONFIG({
                            ...USER_CONFIG,
                            background: {
                              ...USER_CONFIG?.background,
                              blurReductionFactor: value,
                            },
                          });
                        }}
                        value={
                          USER_CONFIG?.background?.blurReductionFactor ?? 80
                        }
                        minimumValue={0}
                        maximumValue={20}
                      />
                    </>
                  )}
                </View>
              </ScrollView>
            );
          },
        },
      ],
    },
    {
      slug: "mainScreen",
      body: [
        {
          title: "Налаштування головного екрану",
          value: USER_CONFIG?.mainScreen?.isCustomisation || false,
          button: <Icons.CaretRight size={34} color={white} />,
          onPress: () => {
            navigation.navigate("HiddenStack", {
              screen: "MainScreenCustomisation",
              params: {
                userConfig: USER_CONFIG,
              },
            });
          },
        },
      ],
    },
  ];

  return (
    <DefaultScreenWidget>
      <ScrollView style={{ paddingTop: 20 }}>
        {CUSTOMISATION_SETTINGS_V1.map((items, index) => (
          <View key={index} style={{ marginBottom: 0 }}>
            {items.body.map((item, index) => {
              const itemKey = `${items.slug || items.title || "group"}-${item.title}-${index}`;
              const isExpanded = Boolean(item?.value) || expandedItems[itemKey];

              if (!animatedValues.current[itemKey]) {
                animatedValues.current[itemKey] = new Animated.Value(
                  isExpanded ? 1 : 0
                );
              }

              return (
                <View key={index}>
                  <SettingsItemWidget
                    key={index}
                    title={item.title}
                    subtitle={item.description || ""}
                    button={{ Icon: item.button }}
                    onPress={() => {
                      if (item.onPress) {
                        const nextValue =
                          typeof item.value === "boolean"
                            ? !item.value
                            : undefined;
                        item.onPress();

                        if (item.body) {
                          if (typeof nextValue === "boolean") {
                            setExpandedState(itemKey, nextValue);
                          } else {
                            toggleExpanded(itemKey);
                          }
                        }
                      } else if (item.body) {
                        toggleExpanded(itemKey);
                      }
                    }}
                    // onPressBody={() => {}}
                  />

                  {item?.body && (
                    <Animated.View
                      style={{
                        opacity:
                          animatedValues.current[itemKey]?.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1],
                          }) || 0,
                        overflow: "hidden",
                        transform: [
                          {
                            translateY:
                              animatedValues.current[itemKey]?.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-20, 0],
                              }) || -20,
                          },
                        ],
                      }}
                    >
                      {isExpanded && item.body({})}
                    </Animated.View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
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
                {
                  key: "Home",
                  name: "Home",
                  params: undefined,
                },
                {
                  key: "Liked",
                  name: "Liked",
                  params: undefined,
                },
                {
                  key: "Download",
                  name: "Download",
                  params: undefined,
                },
                {
                  key: "Settings",
                  name: "Settings",
                  params: undefined,
                },
                {
                  key: "AnimeList",
                  name: "AnimeList",
                  params: undefined,
                },
              ],
            }}
          />
        </View>
      )}
    </DefaultScreenWidget>
  );
}

const styles = StyleSheet.create({
  bsContainer: {
    width: "100%",
    backgroundColor: "transparent",
    marginTop: 8,
    shadowColor: "#000",
    paddingHorizontal: 15,

    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cacheBox: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  textContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    width: "70%",
  },
  title: {
    color: white,
    fontWeight: "600",
  },
  button: {
    backgroundColor: appColor,
    borderRadius: 8,
  },
  // Стилі для SliderWidget
  sliderContainer: {
    backgroundColor: "transparent",
    width: "100%",
    borderRadius: 8,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: White(0.15),
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: appColor,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sliderWrapper: {
    alignItems: "center",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderThumb: {
    backgroundColor: appColor,
    borderWidth: 3,
    borderColor: white,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
  },
  rangeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  rangeText: {
    color: White(0.6),
    fontSize: 12,
    fontWeight: "500",
  },
  title: {
    textAlign: "center",
    fontFamily: "Quicksand",
    fontWeight: "bold",
  },
  picker: {
    gap: 20,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  pickerContainer: {
    alignSelf: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,

    elevation: 10,
  },
  panelStyle: {
    borderRadius: 16,
    width: 190,
    height: 190,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  sliderStyle: {
    width: 190,
    height: 190,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  sliderVerticalStyle: {
    borderRadius: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  colorPickerContainer: {
    backgroundColor: "transparent",
    width: "100%",
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: White(0.15),
  },

  previewStyle: {
    height: 40,
    borderRadius: 14,
  },
  swatchesContainer: {
    flexDirection: "column",
    gap: 20,
  },
  swatchStyle: {
    borderRadius: 20,
    height: 30,
    width: 30,
    margin: 0,
    marginBottom: 0,
    marginHorizontal: 0,
    marginVertical: 0,
  },
});

// function getButton(type, specialParams = {}) {
//   switch (type) {
//     case "button":
//       return specialParams
//         ? {
//             Icon: <Icons.ToggleRight size={34} color={white} />,
//           }
//         : { Icon: <Icons.ToggleLeft size={34} color={black} /> };
//     case "colorPicker":
//       return {
//         Icon: <Icons.Eyedropper size={34} color={specialParams || white} />,
//       };
//     case "photoPicker":
//       return {
//         Icon: <Icons.Image size={34} color={white} />,
//       };
//     case "slider":
//       return {
//         Icon: <Icons.SlidersHorizontal size={34} color={white} />,
//       };
//     default:
//       return {
//         Icon: <Icons.Empty size={34} color={white} />,
//       };
//   }
// }

export function SliderWidget({
  title,
  onValueChange = () => {},
  value = 0,
  minimumValue = 0,
  maximumValue = 100,
}) {
  let len = title.length;
  const [sliderValue, setSliderValue] = useState(value);

  // Оновлюємо локальний стан при зміні пропса value
  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  return (
    <Animated.View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        {len > 1 && <Text style={[H4]}>{title}</Text>}
        <View style={[H4, styles.valueContainer]}>
          <Text style={[H4]}>{sliderValue}</Text>
        </View>
      </View>
      <View style={styles.sliderWrapper}>
        <Slider
          style={styles.slider}
          minimumValue={minimumValue}
          maximumValue={maximumValue}
          step={1}
          value={sliderValue}
          minimumTrackTintColor={appColor}
          maximumTrackTintColor={White(0.2)}
          thumbStyle={styles.sliderThumb}
          trackStyle={styles.sliderTrack}
          onValueChange={(value) => {
            setSliderValue(value);
            onValueChange(value);
          }}
        />
        <View style={styles.rangeLabels}>
          <Text style={H6}>{minimumValue}</Text>
          <Text style={H6}>{maximumValue}</Text>
        </View>
      </View>
    </Animated.View>
  );
}
const customSwatches = new Array(6)
  .fill("#fff")
  .map(() => colorKit.randomRgbColor().hex());

export function ColorPickerWidget({
  title,
  onValueChange = () => {},
  onComplete = () => {},
  value = appColor,
}) {
  const [pickerColor, setPickerColor] = useState(
    typeof value === "string" ? value : customSwatches[0]
  );
  const [isOpened, setIsOpened] = useState(false);
  let len = title.length;
  if (!isOpened) {
    return (
      <SettingsItemWidget
        title={title}
        subtitle={""}
        button={{
          Icon: <Icons.PaintBrush size={34} color={value} />,
        }}
        onPress={() => setIsOpened(true)}
        color={value === appColor ? black : appColor}
      />
    );
  } else {
    return (
      <Animated.View style={styles.colorPickerContainer}>
        <View style={styles.sliderHeader}>
          {len > 1 && (
            <Text style={[H4, { paddingTop: 4, paddingLeft: 9 }]}>{title}</Text>
          )}
          <TouchableOpacity
            style={{
              marginRight: 8,
              backgroundColor: "transparent",
              borderRadius: 8,
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => setIsOpened(false)}
          >
            <Icons.CaretDown size={34} color={appColor} />
          </TouchableOpacity>
        </View>

        <View style={styles.sliderWrapper}>
          <ColorPicker
            value={pickerColor}
            sliderThickness={25}
            thumbSize={24}
            thumbShape="circle"
            onChange={(c) => {
              "worklet";
              const hex = c?.hex ?? pickerColor;
              runOnJS(setPickerColor)(hex);
              runOnJS(onValueChange)(c);
            }}
            onComplete={(c) => {
              "worklet";
              const hex = c?.hex ?? pickerColor;
              runOnJS(setPickerColor)(hex);
              runOnJS(onComplete)(c);
            }}
            style={styles.picker}
            boundedThumb
          >
            <View style={{ flexDirection: "column", gap: 15 }}>
              <Panel1 style={styles.panelStyle} />
              <HueSlider style={styles.sliderStyle} />
              <OpacitySlider style={styles.sliderStyle} />
            </View>

            <Swatches
              style={styles.swatchesContainer}
              swatchStyle={styles.swatchStyle}
              colors={customSwatches}
            />
          </ColorPicker>
        </View>
      </Animated.View>
    );
  }
}

export function PhotoPickerWidget({ title, subtitle, onPick }) {
  const [image, setImage] = useState(null);
  let len = title.length;

  const pickImage = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        multiple: false,
        copyToCacheDirectory: true,
      });

      console.log(result, "result");

      const canceled = result?.canceled ?? result?.type === "cancel";
      if (canceled) {
        return null;
      }

      const asset = result?.assets?.[0] || result;
      const uri = asset?.uri || null;
      const name = asset?.name || null;
      const mimeType = asset?.mimeType || null;
      if (!uri) {
        console.warn("Не вдалося отримати URI вибраного зображення");
        return null;
      }

      setImage(uri);
      const payload = { uri, name, mimeType };
      onPick?.(payload);
      return payload;
    } catch (err) {
      console.error("Помилка вибору зображення:", err);
      return null;
    }
  };

  return (
    <TouchableOpacity style={[styles.cacheBox]} activeOpacity={0.9}>
      <View style={styles.textContainer}>
        {len > 1 && <Text style={[H5, styles.title]}>{title}</Text>}
        {subtitle && (
          <Text style={[H6]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: 40,
            height: 40,
            backgroundColor: appColor,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
        onPress={async () => {
          const picked = await pickImage();
          if (!picked) return;
        }}
      >
        <Icons.FilePng size={34} color={white} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
