import { Platform } from "react-native";
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
} from "@notifee/react-native";
import SettingsStorage from "../Storage/SettingsStorage";

export default async function NotificationPermission() {
  try {
    // 1) Перевіряємо поточний стан дозволів на сповіщення
    let settings = await notifee.getNotificationSettings();

    // 2) Якщо заборонено — намагаємось запросити дозвіл (Android 13+)
    if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
      await notifee.requestPermission();
      settings = await notifee.getNotificationSettings();
    }

    // Визначаємо активний channelId (може бути змінений, якщо старий канал занижений/заблокований)
    const storedChannelId =
      SettingsStorage.getParameter("notificationsChannelId") || "AniUA";

    // 3) Перевіряємо існуючий канал; якщо важливість нижча за HIGH — створюємо новий канал з іншим ID
    const existingChannel = await notifee
      .getChannel(storedChannelId)
      .catch(() => null);

    let activeChannelId = storedChannelId;
    if (
      existingChannel &&
      typeof existingChannel.importance === "number" &&
      existingChannel.importance < AndroidImportance.HIGH
    ) {
      // Cпроба створити новий канал з іншим ID, щоб обійти занижену важливість
      activeChannelId = "AniUA_v2";
    }

    await notifee.createChannel({
      id: activeChannelId,
      name: "AniUA",
      importance: AndroidImportance.HIGH,
    });

    // 4) Якщо сповіщення для додатка або каналу заблоковані — відкриваємо налаштування
    const isAniUAChannelBlocked = await notifee
      .isChannelBlocked(activeChannelId)
      .catch(() => false);

    const androidSettings = settings.android || {};
    const areAppNotificationsDisabled =
      Platform.OS === "android" &&
      androidSettings.areNotificationsEnabled === false;

    if (
      settings.authorizationStatus === AuthorizationStatus.BLOCKED ||
      isAniUAChannelBlocked ||
      areAppNotificationsDisabled
    ) {
      console.log(
        "Сповіщення заблоковані. Відкриваю налаштування каналу/додатка."
      );
      // Спробуємо відкрити налаштування каналу; якщо не вийде — загальні налаштування сповіщень
      try {
        await notifee.openChannelSettings(activeChannelId);
      } catch (_) {
        await notifee.openNotificationSettings();
      }
      return;
    }

    // Зберігаємо використаний channelId для інших модулів
    SettingsStorage.setParameter("notificationsChannelId", activeChannelId);

    console.log("Дозвіл на повідомлення надано/активний");
  } catch (error) {
    console.error("Помилка при запиті дозволу на повідомлення:", error);
  }
}
