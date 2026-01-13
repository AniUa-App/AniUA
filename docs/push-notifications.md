# Push Notifications (Expo)

## Огляд

Модуль для відправки push-сповіщень через [Expo Push API](https://docs.expo.dev/push-notifications/overview/). Автоматично сповіщає користувачів про нові епізоди аніме.

## Архітектура

```text
Mobile App (Expo)
      │
      ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  POST /register │────▶│  Supabase REST   │────▶│  push_tokens    │
│  (Bearer token) │     │  + RLS + Trigger │     │  table          │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
┌─────────────────┐     ┌──────────────────┐              │
│  POST /webhooks │────▶│  ExpoPushClient  │◀─────────────┘
│  /episodes      │     │  (Rust service)  │
└─────────────────┘     └──────────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │  Expo Push API   │
                    │  exp.host/--/api │
                    └──────────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │  Mobile Devices  │
                    │  (iOS/Android)   │
                    └──────────────────┘
```

## API Endpoints

### POST `/v1/notifications/register`

Реєструє push-токен пристрою.

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <user_token>` - JWT токен користувача з Supabase Auth |
| `Content-Type` | Yes | `application/json` |

**Request Body:**

```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**Responses:**

| Status | Description |
|--------|-------------|
| 201 | Token registered successfully |
| 200 | Token already registered |
| 400 | Invalid token format |
| 401 | Authorization header required or invalid token |
| 500 | Internal server error |

**Example:**

```bash
curl -X POST https://api.example.com/v1/notifications/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"}'
```

---

### DELETE `/v1/notifications/unregister`

Видаляє push-токен (відписка від сповіщень).

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <user_token>` - JWT токен користувача |
| `Content-Type` | Yes | `application/json` |

**Request Body:**

```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**Responses:**

| Status | Description |
|--------|-------------|
| 200 | Token unregistered successfully |
| 401 | Authorization header required or invalid token |
| 403 | Can only delete own tokens |
| 500 | Internal server error |

---

## Автоматичні сповіщення

При створенні нового епізоду через `/v1/webhooks/episodes` або `/v1/webhooks/episodes/batch` автоматично відправляються push-сповіщення всім зареєстрованим пристроям.

### Формат сповіщення

```json
{
  "title": "Нова серія: Назва аніме",
  "body": "Епізод 5 від команди TeamName",
  "data": {
    "type": "new_episode",
    "slug": "anime-slug",
    "episode": 5,
    "team": "TeamName",
    "poster": "https://...",
    "video_url": "https://...",
    "player": "ashdi",
    "player_id": "12345",
    "imdb_id": "tt1234567",
    "mal_id": "12345",
    "name_ua": "Назва українською",
    "name_en": "English Name",
    "name_jp": "日本語名"
  }
}
```

---

## База даних

### Таблиця `push_tokens`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `token` | TEXT | Expo push token (unique) |
| `reference` | UUID | FK → User_details.reference |
| `created_at` | TIMESTAMPTZ | Час створення |
| `updated_at` | TIMESTAMPTZ | Час оновлення |

### Авторизація

Авторизація через **Supabase Auth JWT токен** (`Authorization: Bearer <token>`).

Supabase автоматично встановлює `auth.uid()` на основі токена.

**Права доступу:**

| Дія | Хто може |
|-----|----------|
| Реєстрація push-токена | Будь-який авторизований користувач |
| Видалення свого токена | Будь-який авторизований користувач |
| Видалення чужого токена | Тільки `admin` |
| Створення епізодів (тригер push) | `admin`, `moder`, `team` |

**RLS Policies:**

| Operation | Rule |
|-----------|------|
| SELECT | Користувач бачить свої токени (`reference = auth.uid()`); admin бачить всі |
| INSERT | Будь-який авторизований користувач |
| UPDATE | Користувач оновлює свої; admin оновлює всі |
| DELETE | Користувач видаляє свої; admin видаляє всі |

**Тригери:**

| Trigger | Action |
|---------|--------|
| `validate_push_token_insert` | Перевіряє `auth.uid()`, автоматично встановлює `reference` |
| `validate_push_token_update` | Перевіряє права на оновлення (власник або admin) |
| `validate_push_token_delete` | Перевіряє права на видалення (власник або admin) |

---

## Інтеграція з Expo (React Native)

### 1. Встановлення

```bash
npx expo install expo-notifications expo-device expo-constants
```

### 2. Отримання токена

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permission not granted');
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });

  return token.data;
}
```

### 3. Реєстрація на сервері

```typescript
import { supabase } from './supabase'; // ваш Supabase клієнт

async function registerTokenOnServer(token: string) {
  // Отримуємо JWT токен поточного користувача
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch('https://api.example.com/v1/notifications/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    throw new Error(`Failed to register: ${response.status}`);
  }

  return response.json();
}
```

### 4. Обробка сповіщень

```typescript
import * as Notifications from 'expo-notifications';

// Налаштування поведінки при отриманні
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Обробка натискання на сповіщення
const subscription = Notifications.addNotificationResponseReceivedListener(
  (response) => {
    const data = response.notification.request.content.data;

    if (data.type === 'new_episode') {
      // Навігація до епізоду
      navigation.navigate('Episode', {
        slug: data.slug,
        episode: data.episode,
      });
    }
  }
);

// Не забудьте відписатися
// subscription.remove();
```

---

## Конфігурація

### Environment Variables

```env
# Supabase
SUPABASE_REST_URL=http://supabase.server/rest/v1
JWT_TOKEN=your-supabase-anon-key

# Database (для прямих запитів)
DB_HOST=supabase.server
DB_PORT=5433
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-password
```

---

## Обробка помилок

### Невалідні токени

Якщо Expo повертає `DeviceNotRegistered`, токен автоматично видаляється з бази даних.

### Ліміти Expo

- Максимум 100 повідомлень за один запит (батчинг автоматичний)
- Rate limit: ~600 запитів/хв

---

## Файлова структура

```text
src/
├── notifications/
│   ├── mod.rs          # Модуль
│   ├── expo.rs         # ExpoPushClient
│   └── types.rs        # Типи (ExpoPushMessage, etc.)
├── endpoints/v1/
│   └── notifications/
│       ├── mod.rs      # Конфігурація routes
│       ├── register.rs # POST/DELETE endpoints
│       └── types.rs    # Request/Response types
migrations/
└── 001_create_push_tokens.sql  # SQL міграція
docs/
└── push-notifications.md       # Ця документація
```
