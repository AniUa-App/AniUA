import { StyleSheet, Text } from "react-native";
import { appColor, loaderColor, white } from "../Styles/Colors";
import { H3 } from "../Styles/Fonts";
import Icon from "../Styles/Icons";
import { useState, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { TouchableOpacity } from "./Button";
import AnimeStorage from "../Storage/AnimeStorage";
import SystemNavigationBar from "react-native-system-navigation-bar";

function goToPlayer(navigation, player, item, episodesList, anime, dubbing) {
  if (player === "Вбудований плеєр") {
    navigation.navigate("HiddenStack", {
      screen: "LocalVideoPlayer",
      params: {
        _episodes: episodesList[player][dubbing],
        _currentEpisode: item,
        _anime: anime,
      },
    });
  } else {
    navigation.navigate("HiddenStack", {
      screen: "WebVideoPlayer",
      params: {
        videoUrl: item?.video_url,
        title: `${anime?.title_ua} - ${item?.episode} серія`,
      },
    });
  }
}

// Буде повертати текст для кнопки, нову data та функцію
export function ViewEpisode({ navigation, episodesList, info, anime }) {
  // Перевірка на наявність необхідних даних
  if (!info || !info.watched || !episodesList) {
    return {
      text: "Завантаження...",
      data: info || {},
      function: () => {},
    };
  }

  const player = info?.watched?.player;
  const dubbing = info?.watched?.dubbing;

  // Перевірка наявності playerData
  if (
    !player ||
    !dubbing ||
    !episodesList[player] ||
    !episodesList[player][dubbing]
  ) {
    return {
      text: "Немає перекладу",
      data: info,
      function: () => {},
      style: {
        backgroundColor: loaderColor,
      },
    };
  }

  const episodes = episodesList[player][dubbing];
  const viewed_episodes = [...(info?.watched?.episodes || [])];

  // Додати в обрані
  if (Math.max(...viewed_episodes) === anime?.episodes_total) {
    console.log("Додати в обрані");
    if (info?.isFavorite) {
      return {
        text: `Поділитись`,
        data: info,
        function: () => {},
      };
    }
    return {
      text: `Додати в обрані`,
      data: { ...info, isFavorite: !(info?.isFavorite || false) },
      function: () => {
        // Тут можна додати додаткову логіку, якщо потрібно
      },
    };
  }

  //
  //
  //
  // Продовжити перегляд
  else if (viewed_episodes.length > 0) {
    console.log("Продовжити перегляд");

    const last_episode_index = Math.max(...viewed_episodes);
    console.log("last_episode_index", last_episode_index);
    console.log("viewed_episodes", viewed_episodes);
    console.log("Math.max(...viewed_episodes)", Math.max(...viewed_episodes));
    console.log("episodes[last_episode_index]", episodes[last_episode_index]);
    console.log("episodes", episodes);
    console.log("anime?.episodes_released", anime?.episodes_released);

    // якщо доступних перекладених серій більше ніж анонсованих епізодів

    if (episodes.length > anime?.episodes_released) {
      if (last_episode_index < episodes.length) {
        console.log("last_episode_index", last_episode_index);
        const last_episode = episodes[last_episode_index];

        return {
          text: `Дивитись ${last_episode_index + 1} серію`,
          data: {
            ...info,
            watched: { ...info.watched, episodes: viewed_episodes },
          },
          function: () => {
            // navigation.navigate('HiddenStack', {
            //   screen: 'WebVideoPlayer',
            //   params: {
            //     videoUrl: last_episode?.video_url,
            //     title: `${anime?.title_ua} - ${last_episode?.episode} серія`,
            //   },
            // }),
            goToPlayer(
              navigation,
              player,
              last_episode,
              episodesList,
              anime,
              dubbing
            );
            SystemNavigationBar.navigationHide();
          },
        };
      } else {
        console.log("Додати в обрані");
        if (info?.isFavorite) {
          return {
            text: `Поділитись`,
            data: info,
            function: () => {},
          };
        }
        return {
          text: `Додати в обрані`,
          data: { ...info, isFavorite: !(info?.isFavorite || false) },
          function: () => {
            // Тут можна додати додаткову логіку, якщо потрібно
          },
        };
      }
    }
    // Якщо остання переглянута серія не дорівнює останній серії
    else if (
      last_episode_index !== anime?.episodes_released &&
      episodes[last_episode_index]
    ) {
      const last_episode = episodes[last_episode_index];
      viewed_episodes.push(last_episode.episode);

      return {
        text: `Дивитись ${last_episode.episode} серію`,
        data: {
          ...info,
          watched: { ...info.watched, episodes: viewed_episodes },
        },
        function: () => {
          goToPlayer(
            navigation,
            player,
            last_episode,
            episodesList,
            anime,
            dubbing
          );
          SystemNavigationBar.navigationHide();
        },
      };
    } else if (anime?.episodes_released === Math.max(...viewed_episodes)) {
      return {
        text: `${anime?.episodes_released + 1} серія ще не вийшла`,
        data: info,
        function: () => {},
        style: {
          backgroundColor: loaderColor,
        },
      };
    } else {
      return {
        text: `Серія ${last_episode_index + 1} не перекладена`,
        data: info,
        function: () => {},
        style: {
          backgroundColor: loaderColor,
        },
      };
    }
  }
  //
  //
  //
  // Почати перегляд
  else if (viewed_episodes.length === 0) {
    console.log("Почати перегляд");
    if (!episodes[0]) {
      return {
        text: "Серії недоступні",
        data: info,
        function: () => {},
      };
    }

    viewed_episodes.push(episodes[0].episode);

    return {
      text: `Почати перегляд`,
      data: {
        ...info,
        watched: { ...info.watched, episodes: viewed_episodes },
      },
      function: () => {
        goToPlayer(
          navigation,
          player,
          episodes[0],
          episodesList,
          anime,
          dubbing
        );
        SystemNavigationBar.navigationHide();
      },
    };
  } else {
    return {
      text: `Поділитись`,
      data: info,
      function: () => {
        // Явно зберігаємо оновлений стан в сховищі
      },
    };
  }

  // Запасний варіант
  return {
    text: "",
    data: info,
    function: () => {},
  };
}

export function ForwardButton({
  navigation,
  anime,
  errorCode,
  episodesList,
  style,
  disabled = false,
  data,
  onDataChange,
  ...props
}) {
  const [isData, setIsData] = useState(null);
  const [data_, setData_] = useState(null);

  useEffect(() => {
    setIsData(data?.watched?.player && data?.watched?.dubbing ? true : null);

    if (errorCode === 404) {
      setIsData(false);
    } else if (!episodesList || episodesList?.length === 0) {
      setIsData(null);
    }

    try {
      // Обгорнемо в try/catch для безпеки
      const result = ViewEpisode({
        navigation,
        episodesList,
        info: data,
        anime: anime,
      });

      if (result) {
        const { text, data: newData, function: func, style: style_ } = result;
        setData_({
          text,
          data: newData,
          function: () => {
            // Зберігаємо оновлені дані в AnimeStorage перед виконанням функції
            if (anime?.slug && newData) {
              AnimeStorage.setInfoBySlug(anime.slug, newData);
              // Повідомляємо батьківський компонент про зміну даних
              if (onDataChange) {
                onDataChange(newData);
              }
            }
            // Викликаємо оригінальну функцію
            func();
          },
          style: style_,
        });
      }
    } catch (error) {
      console.error("Помилка у ForwardButton:", error);
      setIsData(false);
    }
  }, [data, episodesList, errorCode]);

  return (
    <>
      {isData === null ? (
        <TouchableOpacity
          style={[
            style,
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: loaderColor,
            },
          ]}
          disabled={disabled}
          activeOpacity={0.7}
          {...props}
        >
          <ActivityIndicator size="31" color={appColor} />
        </TouchableOpacity>
      ) : isData === true && data_ ? (
        <TouchableOpacity
          style={[
            style,
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            },
            data_.style,
          ]}
          onPress={data_.function}
          disabled={disabled}
          activeOpacity={0.7}
          {...props}
        >
          <Icon.PlayCircle size={34} color={white} />
          <Text
            style={[
              H3,
              {
                color: white,
                paddingLeft: 15,
                fontSize: data_.text.length > 15 ? 18 : 20,
              },
            ]}
          >
            {data_.text || ""}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            style,
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: loaderColor,
            },
          ]}
          disabled={disabled}
          activeOpacity={0.7}
          {...props}
        >
          <Text style={[H3, { color: white }]}>Немає перекладу</Text>
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  button: {},
});
