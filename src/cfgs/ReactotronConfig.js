import Reactotron, { trackGlobalErrors } from "reactotron-react-native";
import apisaucePlugin from "reactotron-apisauce";
import mmkvPlugin from "reactotron-react-native-mmkv";
import Storage from "../Storage/Storage";

// Отримуємо екземпляр MMKV
const mmkvInstance = Storage.getMMKVInstance();

// Налаштовуємо Reactotron
const reactotron = Reactotron
  .configure({
    name: "AniUA",
    host: "localhost", // явно вказуємо хост
    port: 9090 // явно вказуємо порт
  })
  .useReactNative(); // додаємо вбудовані плагіни

// Додаємо плагіни
reactotron
  .use(apisaucePlugin())
  .use(trackGlobalErrors());

// Додаємо плагін MMKV тільки якщо екземпляр існує і має потрібні методи
if (mmkvInstance && typeof mmkvInstance.addOnValueChangedListener === 'function') {
  console.log("MMKV інстанс доступний");
  reactotron.use(mmkvPlugin({
    storage: mmkvInstance,
    ignore: ['secret-key'] // опціонально: ігнорування певних ключів
  }));
} else {
  console.warn("MMKV інстанс не містить методу addOnValueChangedListener - плагін MMKV не буде підключено");
}

// Підключаємося до Reactotron
reactotron.connect();

// Для зручності у debug консолі
if (__DEV__) {
  console.log("Reactotron конфігурація завантажена");
  console.log("MMKV інстанс:", mmkvInstance ? "доступний" : "недоступний");
}

export default reactotron;