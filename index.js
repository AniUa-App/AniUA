import { registerRootComponent } from "expo";
import notifee from "@notifee/react-native";

import App from "./App";

import {
  setupBackgroundHandler,
  setupForegroundHandler,
} from "./src/Global/Actions";
import MainConfig from "./src/cfgs/MainConfig";

function app() {
  return <App />;
}
// Ініціалізуємо обробник для фонових подій
setupBackgroundHandler();

// Ініціалізуємо обробник для foreground подій
const foregroundHandler = setupForegroundHandler();

registerRootComponent(app);
