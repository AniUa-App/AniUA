import { registerRootComponent } from "expo";
import notifee from "@notifee/react-native";

import App from "./App";

import {
  setupBackgroundHandler,
  setupForegroundHandler,
} from "./src/Global/Actions";
import MainConfig from "./src/cfgs/MainConfig";
import { getUniqueAccountId } from "./src/Api/api";

// Ініціалізуємо обробник для фонових подій
setupBackgroundHandler();

// Ініціалізуємо обробник для foreground подій
const foregroundHandler = setupForegroundHandler();

registerRootComponent(App);
