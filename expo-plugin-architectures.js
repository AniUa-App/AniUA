const {
  withGradleProperties,
  withAppBuildGradle,
} = require("expo/config-plugins");

const withArchitectures = (config, architectures) => {
  const archs = architectures || [
    "armeabi-v7a",
    "arm64-v8a",
    "x86",
    "x86_64",
  ];

  // Set reactNativeArchitectures in gradle.properties
  config = withGradleProperties(config, (cfg) => {
    const props = cfg.modResults;
    const existing = props.find(
      (p) => p.type === "property" && p.key === "reactNativeArchitectures"
    );

    if (existing) {
      existing.value = archs.join(",");
    } else {
      props.push({
        type: "property",
        key: "reactNativeArchitectures",
        value: archs.join(","),
      });
    }

    console.log(
      `[expo-plugin-architectures] Set reactNativeArchitectures=${archs.join(",")}`
    );
    return cfg;
  });

  // Add ndk.abiFilters to defaultConfig to force all architectures in every build
  config = withAppBuildGradle(config, (cfg) => {
    const abiFilters = archs.map((a) => `"${a}"`).join(", ");
    const ndkBlock = `        ndk {\n            abiFilters ${abiFilters}\n        }`;

    if (cfg.modResults.contents.includes("ndk {")) {
      // Replace existing ndk block
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /ndk\s*\{[^}]*\}/,
        `ndk {\n            abiFilters ${abiFilters}\n        }`
      );
    } else {
      // Insert ndk block after versionName in defaultConfig
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /(versionName\s+["'][^"']*["'])/,
        `$1\n${ndkBlock}`
      );
    }

    console.log(
      `[expo-plugin-architectures] Set ndk.abiFilters=${archs.join(",")}`
    );
    return cfg;
  });

  return config;
};

module.exports = withArchitectures;
