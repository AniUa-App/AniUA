const { withAndroidManifest } = require("@expo/config-plugins");

const withTvChannels = (config) => {
  return withAndroidManifest(config, async (cfg) => {
    const manifest = cfg.modResults.manifest;

    if (!manifest["uses-permission"]) {
      manifest["uses-permission"] = [];
    }

    const hasPermission = manifest["uses-permission"].some(
      (p) =>
        p.$?.["android:name"] ===
        "com.android.providers.tv.permission.WRITE_EPG_DATA"
    );

    if (!hasPermission) {
      manifest["uses-permission"].push({
        $: {
          "android:name": "com.android.providers.tv.permission.WRITE_EPG_DATA",
        },
      });
    }

    console.log("[react-native-tv-channels] WRITE_EPG_DATA permission added");
    return cfg;
  });
};

module.exports = withTvChannels;
