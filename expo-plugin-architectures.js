const { withGradleProperties } = require("@expo/config-plugins");

const withArchitectures = (config, architectures) => {
  const archs = architectures || [
    "armeabi-v7a",
    "arm64-v8a",
    "x86",
    "x86_64",
  ];

  return withGradleProperties(config, (cfg) => {
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
};

module.exports = withArchitectures;
