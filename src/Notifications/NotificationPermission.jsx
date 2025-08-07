import { checkNotificationPermission } from '../Permissions/Permissions';

export default async function NotificationPermission() {
  try {
    if (await checkNotificationPermission()) {
      console.log('Дозвіл на повідомлення надано');
    } else {
        console.log('Дозвіл на повідомлення відхилено');
    }
  } catch (error) {
    console.error('Помилка при запиті дозволу на повідомлення:', error);
  }
};
