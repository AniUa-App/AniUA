const {
  withAndroidManifest,
  withDangerousMod,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const drawableDirectoryNames = [
  "drawable",
  "drawable-hdpi",
  "drawable-mdpi",
  "drawable-xhdpi",
  "drawable-xxhdpi",
  "drawable-xxxhdpi",
];

const withTVBannerImage = (config) => {
  const bannerPath = config.android?.tvBanner;
  if (!bannerPath) {
    return config;
  }

  return withDangerousMod(config, [
    "android",
    async (cfg) => {
      const resolvedBannerPath = path.resolve(cfg.modRequest.projectRoot, bannerPath);
      if (!fs.existsSync(resolvedBannerPath)) {
        console.warn(
          `[expo-plugin-tv-support] TV banner image not found: ${resolvedBannerPath}`
        );
        return cfg;
      }

      const ext = path.extname(resolvedBannerPath);
      const destFileName = `tv_banner${ext}`;

      for (const dirName of drawableDirectoryNames) {
        const dirPath = path.join(
          cfg.modRequest.platformProjectRoot,
          "app",
          "src",
          "main",
          "res",
          dirName
        );
        if (!fs.existsSync(dirPath)) {
          await fs.promises.mkdir(dirPath, { recursive: true });
        }
        await fs.promises.copyFile(
          resolvedBannerPath,
          path.join(dirPath, destFileName)
        );
      }

      console.log(
        `[expo-plugin-tv-support] TV banner image copied to drawable folders`
      );
      return cfg;
    },
  ]);
};

const withTVManifest = (config) => {
  return withAndroidManifest(config, async (cfg) => {
    const manifest = cfg.modResults.manifest;

    // Add leanback feature (not required, so app works on both TV and mobile)
    if (!manifest["uses-feature"]) {
      manifest["uses-feature"] = [];
    }

    const hasLeanback = manifest["uses-feature"].some(
      (f) => f.$?.["android:name"] === "android.software.leanback"
    );
    if (!hasLeanback) {
      manifest["uses-feature"].push({
        $: {
          "android:name": "android.software.leanback",
          "android:required": "false",
        },
      });
    }

    // Mark touchscreen as not required (TVs don't have touchscreens)
    const hasTouchscreen = manifest["uses-feature"].some(
      (f) => f.$?.["android:name"] === "android.hardware.touchscreen"
    );
    if (!hasTouchscreen) {
      manifest["uses-feature"].push({
        $: {
          "android:name": "android.hardware.touchscreen",
          "android:required": "false",
        },
      });
    }

    // Add LEANBACK_LAUNCHER category and TV banner to main activity
    const application = manifest.application?.[0];
    if (application) {
      // Add android:banner to <application> if tvBanner is configured
      if (cfg.android?.tvBanner && application.$) {
        application.$["android:banner"] = "@drawable/tv_banner";
        console.log(
          "[expo-plugin-tv-support] Added android:banner to application"
        );
      }

      if (application.activity) {
        const mainActivity = application.activity.find(
          (activity) =>
            activity.$?.["android:name"] === ".MainActivity" ||
            activity.$?.["android:name"]?.endsWith(".MainActivity")
        );

        if (mainActivity?.["intent-filter"]) {
          const mainIntentFilter = mainActivity["intent-filter"].find(
            (filter) =>
              filter.action?.some(
                (a) =>
                  a.$?.["android:name"] === "android.intent.action.MAIN"
              )
          );

          if (mainIntentFilter) {
            if (!mainIntentFilter.category) {
              mainIntentFilter.category = [];
            }

            const hasLeanbackLauncher = mainIntentFilter.category.some(
              (c) =>
                c.$?.["android:name"] ===
                "android.intent.category.LEANBACK_LAUNCHER"
            );

            if (!hasLeanbackLauncher) {
              mainIntentFilter.category.push({
                $: {
                  "android:name":
                    "android.intent.category.LEANBACK_LAUNCHER",
                },
              });
            }
          }
        }
      }
    }

    console.log("[expo-plugin-tv-support] Android TV manifest entries added");
    return cfg;
  });
};

const withTVSupport = (config) => {
  config = withTVBannerImage(config);
  config = withTVManifest(config);
  return config;
};

module.exports = withTVSupport;
