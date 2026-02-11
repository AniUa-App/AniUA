const { withAndroidManifest } = require("@expo/config-plugins");

const withTVSupport = (config) => {
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

    // Add LEANBACK_LAUNCHER category to main activity intent-filter
    const application = manifest.application?.[0];
    if (application?.activity) {
      const mainActivity = application.activity.find(
        (activity) =>
          activity.$?.["android:name"] === ".MainActivity" ||
          activity.$?.["android:name"]?.endsWith(".MainActivity")
      );

      if (mainActivity?.["intent-filter"]) {
        const mainIntentFilter = mainActivity["intent-filter"].find((filter) =>
          filter.action?.some(
            (a) => a.$?.["android:name"] === "android.intent.action.MAIN"
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
                "android:name": "android.intent.category.LEANBACK_LAUNCHER",
              },
            });
          }
        }
      }
    }

    console.log("[expo-plugin-tv-support] Android TV manifest entries added");
    return cfg;
  });
};

module.exports = withTVSupport;
