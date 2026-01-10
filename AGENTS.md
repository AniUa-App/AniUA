# Repository Guidelines

## Project Structure & Module Organization
The Expo entry (`App.jsx`, `index.js`) bootstraps screens under `src/Screens`, while widgets, storage, configuration, API sources, and notification logic live in their respective folders under `src`. Native helpers, patches, and build tweaks sit in `android/`, `react-native-file-opener/`, and `patches/`. Screenshots and other static assets live in `assets/`. Distribution artifacts are generated into `dist/` and `.apk` files at the repo root—do not edit them manually.

## Build, Test, and Development Commands
Use `npm install` once to pull dependencies. `npm start` launches Expo Dev Client; combine with the Expo Go app for quick checks. `npm run android` prepares env variables (via `scripts/set-environment.js`) and builds a native dev binary. For production-style builds rely on `npx eas build --profile alpha` (APK) or `--profile aab-alpha` (Play Store bundle). `npm run update-beta` pushes an OTA update to the beta channel after `npm run set-env` seeds secrets. When working on native modules, run `npm run prebuild` to regenerate the Android project and reapply patches.

## Coding Style & Naming Conventions
The ESLint flat config (`eslint.config.mjs`) extends the React and TypeScript recommended presets—keep files lint-clean by running `npx eslint src`. Components live in PascalCase files (`ScreenController.tsx`), hooks in `useCamelCase.ts`, and configuration/constants in lowerCamelCase modules. Favor 2-space indentation, single quotes in JSON, and descriptive names for storage keys (see `src/Storage`). Keep UI text in Ukrainian unless UX requires English.

## Testing Guidelines
There is no automated test suite yet, so rely on exploratory testing inside Expo Dev Client and instrumented builds. Validate downloads, playback controls, and PiP behavior on both phone and tablet emulator scripts (`run-emo-*`). Regression-test authentication flows against the Hikka backend whenever touching `src/Sources` or `HikkaAuthService`. Report manual testing notes in your PR description until Jest/e2e scaffolding is added.

## Commit & Pull Request Guidelines
Existing history favors short imperative subjects (English or Ukrainian) such as `Полагодив кнопки навігації` or `Update LICENSE`. Keep commits focused, reference the impacted module (`Screens`, `Sources`, etc.), and avoid “changes” unless the touch-set is trivial. PRs should link the related issue or roadmap item, describe user-facing impact, list test devices (e.g., “Pixel 6 Pro emulator, Expo Go”), and attach screenshots for UI tweaks. Forks are disallowed by license, so always propose changes via PRs to this repository.
