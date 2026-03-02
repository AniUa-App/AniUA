const { withAndroidManifest } = require("expo/config-plugins");

const PERMISSIONS_TO_REMOVE = [
  "com.google.android.gms.permission.AD_ID",
  "android.permission.REQUEST_INSTALL_PACKAGES",
];

const withRemovePermissions = (config, permissions = PERMISSIONS_TO_REMOVE) => {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;

    if (!manifest["uses-permission"]) {
      manifest["uses-permission"] = [];
    }

    for (const permission of permissions) {
      const exists = manifest["uses-permission"].some(
        (p) => p.$?.["android:name"] === permission
      );

      if (!exists) {
        manifest["uses-permission"].push({
          $: {
            "android:name": permission,
            "tools:node": "remove",
          },
        });
        console.log(
          `[expo-plugin-remove-permissions] Marked ${permission} for removal`
        );
      }
    }

    // Ensure tools namespace is declared
    if (!manifest.$["xmlns:tools"]) {
      manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";
    }

    return cfg;
  });
};

module.exports = withRemovePermissions;
