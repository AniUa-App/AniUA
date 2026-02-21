# Фікс: Invalid notification (no valid small icon)

## Симптом

Реліз APK крашиться одразу при спробі завантажити серію:

```
java.lang.IllegalArgumentException: Invalid notification (no valid small icon)
    at app.notifee.core.ForegroundService.onStartCommand(...)
```

Debug APK працює нормально.

## Причина

Notifee шукає іконку сповіщення через `Resources.getIdentifier()`:

```java
// notifee перевіряє mipmap ПЕРШИМ, потім drawable
int id = getIdentifier("ic_stat_aniua", "mipmap", packageName);
if (id == 0) id = getIdentifier("ic_stat_aniua", "drawable", packageName);
if (id == 0) return null; // → notification будується без іконки → crash
```

Якщо `getIdentifier` повертає `0` для обох → `setSmallIcon()` ніколи не викликається →
Android кидає виняток при `startForeground()`.

В release білді з `shrinkResources=true` ресурс `ic_stat_aniua` може бути видалений
resource shrinker-ом, тому що:
- Шринкер не може статично простежити `getIdentifier()` виклики (рядкові lookup'и)
- `tools:keep` в `keep.xml` допомагає, але не є 100% надійним при агресивному R8

## Фікс (три рівні захисту)

### 1. Маніфест (найнадійніше — завжди)

`android/app/src/main/AndroidManifest.xml`:
```xml
<application ...>
    <!-- Resource shrinker ЗАВЖДИ зберігає ресурси з маніфестними посиланнями -->
    <meta-data android:name="app.notifee.default_notification_icon"
               android:resource="@mipmap/ic_stat_aniua"/>
    ...
</application>
```

### 2. Іконка в mipmap-anydpi-v26 (notifee шукає mipmap першим)

`android/app/src/main/res/mipmap-anydpi-v26/ic_stat_aniua.xml` — копія з `drawable/ic_stat_aniua.xml`.

### 3. keep.xml (backup)

`android/app/src/main/res/raw/keep.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources xmlns:tools="http://schemas.android.com/tools"
    tools:keep="@drawable/ic_stat_aniua,@mipmap/ic_stat_aniua" />
```

### 4. foregroundServiceTypes у JS (обов'язково)

`src/Notifications/VideoDownloader.jsx`:
```js
import notifee, { AndroidForegroundServiceType } from "@notifee/react-native";

// В кожному displayNotification з asForegroundService: true:
android: {
  asForegroundService: true,
  foregroundServiceTypes: [
    AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_SHORT_SERVICE,
  ],
  smallIcon: "ic_stat_aniua",
  ...
}
```

## Якщо проблема повернулась після зміни конфігурації

Перевір по черзі:

```bash
# 1. Чи є файл іконки в mipmap?
ls android/app/src/main/res/mipmap-anydpi-v26/ic_stat_aniua.xml

# 2. Чи є meta-data в маніфесті?
grep "notifee.default_notification_icon" android/app/src/main/AndroidManifest.xml

# 3. Чи є keep.xml?
cat android/app/src/main/res/raw/keep.xml
```

Якщо якийсь файл відсутній після `npm run prebuild` — значить плагін
`expo-plugin-notification-icon.js` не спрацював. Перевір помилки в output prebuild.

Якщо все є, але проблема залишається — перевір `shrinkResources` в gradle.properties:
```properties
android.enableShrinkResourcesInReleaseBuilds=true  # OK, фікс це покриває
android.enableMinifyInReleaseBuilds=true            # OK, R8 правила в proguard-rules.pro
```

## Що автоматично відбувається при `npm run prebuild`

`expo-plugin-notification-icon.js` робить три речі:
1. Записує `ic_stat_aniua.xml` в `res/drawable/` та `res/mipmap-anydpi-v26/`
2. Записує `res/raw/keep.xml` з `tools:keep` для обох ресурсів
3. Додає `<meta-data android:resource="@mipmap/ic_stat_aniua">` в `AndroidManifest.xml`
