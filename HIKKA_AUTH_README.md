# Hikka OAuth Авторизація

Повна реалізація OAuth авторизації для Hikka API в AniUA додатку.

## 📋 Зміст

- [Встановлення](#встановлення)
- [Конфігурація](#конфігурація)
- [Використання](#використання)
- [API Документація](#api-документація)
- [Приклади](#приклади)

## 🚀 Встановлення

Всі необхідні файли вже створені:

```
src/
├── Storage/
│   └── HikkaAuthStorage.ts        # Storage для токенів
├── Services/
│   └── HikkaAuthService.ts        # OAuth сервіс
├── Components/
│   └── HikkaAuthButton.tsx        # UI компонент
└── Sources/
    └── HikkaApiComplete.ts        # Повний API клієнт
```

## ⚙️ Конфігурація

### 1. Створення додатку на Hikka

1. Перейдіть на https://hikka.io/settings/applications
2. Створіть новий додаток
3. Вкажіть:
   - **Назва**: AniUA
   - **Опис**: Додаток для перегляду аніме з українським озвученням
   - **Redirect URL**: `aniua://hikka-callback`

### 2. Налаштування змінних оточення

Відредагуйте файл `.env.local`:

```env
# Hikka OAuth Configuration
EXPO_PUBLIC_HIKKA_CLIENT_ID=your_application_id_here
HIKKA_CLIENT_SECRET=your_application_secret_here
EXPO_PUBLIC_HIKKA_REDIRECT_URL=aniua://hikka-callback
```

**ВАЖЛИВО**: Замініть `your_application_id_here` та `your_application_secret_here` на реальні значення з Hikka.

### 3. Перезбірка додатку

Після зміни змінних оточення необхідно перезібрати додаток:

```bash
npm run prebuild
npm run android
```

Або для EAS Build:
```bash
npx eas build --profile alpha
```

## 📱 Використання

### Базове використання

```jsx
import { HikkaAuthButton } from '../Components/HikkaAuthButton';

function SettingsScreen() {
  return (
    <View>
      <HikkaAuthButton
        onAuthSuccess={(user) => {
          console.log('Авторизовано:', user.username);
        }}
        onAuthError={(error) => {
          console.error('Помилка:', error);
        }}
      />
    </View>
  );
}
```

### Кастомні scopes

```jsx
<HikkaAuthButton
  scopes={[
    'read',
    'write',
    'comments:write',
    'watch:write',
    'favourite:write'
  ]}
/>
```

### Перевірка статусу авторизації

```jsx
import { HikkaAuthService } from '../Services/HikkaAuthService';

// Перевірка чи авторизований користувач
if (HikkaAuthService.isAuthenticated()) {
  const user = HikkaAuthService.getCurrentUser();
  console.log('Поточний користувач:', user.username);
}

// Вихід
HikkaAuthService.logout();
```

### Використання API з авторизацією

```jsx
import { HikkaApiComplete } from '../Sources/HikkaApiComplete';

// API автоматично використовує збережений токен
async function addToWatchList(slug) {
  try {
    const result = await HikkaApiComplete.addToWatchList(slug, {
      status: 'watching',
      score: 9,
      episodes: 5
    });
    console.log('Додано до списку:', result);
  } catch (error) {
    console.error('Помилка:', error);
  }
}
```

## 📚 API Документація

### HikkaAuthService

#### Методи

**`initialize()`**
- Ініціалізує сервіс при запуску додатку
- Автоматично відновлює токен зі storage

**`startOAuth(scopes?: string[])`**
- Запускає OAuth flow
- Повертає: `Promise<{success: boolean, token?: string, user?: any, error?: string}>`

**`isAuthenticated(): boolean`**
- Перевіряє чи користувач авторизований

**`getCurrentUser(): any | null`**
- Повертає дані поточного користувача

**`logout()`**
- Виходить з системи та очищає токен

**`refreshUserData(): Promise<any | null>`**
- Оновлює дані користувача з сервера

### HikkaAuthStorage

#### Методи

**`setAuthData(token, expiration, user?)`**
- Зберігає дані авторизації

**`getToken(): string | null`**
- Повертає токен (null якщо протермінований)

**`getUser(): any | null`**
- Повертає дані користувача

**`isAuthenticated(): boolean`**
- Перевіряє наявність валідного токену

**`clearAuth()`**
- Очищує всі дані авторизації

### HikkaApiComplete

Повний список методів див. у файлі `src/Sources/HikkaApiComplete.ts`

#### Основні категорії:

- **Authentication** (12 методів)
- **User Management** (4 методи)
- **Anime** (9 методів)
- **Manga/Novel** (6 методів)
- **Watch List** (7 методів)
- **Read List** (4 методи)
- **Characters/People** (7 методів)
- **Collections** (5 методів)
- **Comments** (7 методів)
- **Notifications** (3 методи)
- **Favorites** (4 методи)
- **Follow** (6 методів)
- **Schedule** (1 метод)

## 💡 Приклади

### Приклад 1: Додавання до улюблених

```jsx
import { HikkaApiComplete } from '../Sources/HikkaApiComplete';
import { HikkaAuthService } from '../Services/HikkaAuthService';

async function addToFavorites(animeSlug) {
  // Перевіряємо авторизацію
  if (!HikkaAuthService.isAuthenticated()) {
    Alert.alert('Увага', 'Для додавання в улюблене потрібно авторизуватись');
    return;
  }

  try {
    await HikkaApiComplete.addToFavorites('anime', animeSlug);
    Alert.alert('Успіх', 'Додано до улюблених!');
  } catch (error) {
    Alert.alert('Помилка', error.message);
  }
}
```

### Приклад 2: Отримання списку перегляду

```jsx
async function getMyWatchList() {
  const user = HikkaAuthService.getCurrentUser();
  if (!user) return [];

  try {
    const result = await HikkaApiComplete.getUserWatchList(user.username, {
      status: 'watching',
      sort: ['score:desc']
    });
    return result.list;
  } catch (error) {
    console.error(error);
    return [];
  }
}
```

### Приклад 3: Написання коментаря

```jsx
async function writeComment(animeSlug, text) {
  if (!HikkaAuthService.isAuthenticated()) {
    Alert.alert('Увага', 'Для написання коментарів потрібно авторизуватись');
    return;
  }

  try {
    await HikkaApiComplete.writeComment('anime', animeSlug, {
      text: text,
      parent: null // або ID батьківського коментаря для відповіді
    });
    Alert.alert('Успіх', 'Коментар опубліковано!');
  } catch (error) {
    Alert.alert('Помилка', error.message);
  }
}
```

### Приклад 4: Підписка на користувача

```jsx
async function followUser(username) {
  if (!HikkaAuthService.isAuthenticated()) {
    return;
  }

  try {
    await HikkaApiComplete.followUser(username);
    Alert.alert('Успіх', `Ви підписались на ${username}`);
  } catch (error) {
    Alert.alert('Помилка', error.message);
  }
}
```

## 🔒 Безпека

1. **Ніколи не коммітьте** `.env.local` файл з реальними ключами
2. **Client Secret** має бути доступний тільки в build time
3. Токени зберігаються в зашифрованому MMKV storage
4. Токени автоматично протерміновуються після 30 хвилин
5. Використовуйте HTTPS для всіх запитів

## 🐛 Відладка

Увімкніть debug режим:

```javascript
// В App.jsx
MainConfig.debug.isDebug = true;
```

Логи будуть доступні через:
```bash
npx react-native log-android
```

## 📝 TODO

- [ ] Додати автоматичне оновлення токену
- [ ] Реалізувати офлайн режим
- [ ] Додати інтеграцію з списками перегляду
- [ ] Створити екран профілю користувача

## 🔗 Посилання

- [Hikka API Документація](https://api.hikka.io/docs)
- [Hikka OAuth Стаття](https://hikka.io/articles/hikka-oauth-ebbd59)
- [Hikka Settings](https://hikka.io/settings/applications)

---

**Автор**: AniUA Team
**Версія**: 1.0.0
**Дата**: 2025-12-12
