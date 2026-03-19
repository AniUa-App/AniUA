const {
  withGradleProperties,
  withAppBuildGradle,
  withDangerousMod,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const withArchitectures = (config, architectures) => {
  const archs = architectures || [
    "armeabi-v7a",
    "arm64-v8a",
    "x86",
    "x86_64",
  ];

  // Enable R8 minification and resource shrinking + set architectures in gradle.properties
  config = withGradleProperties(config, (cfg) => {
    const props = cfg.modResults;
    const setOrReplace = (key, value) => {
      const existing = props.find(
        (p) => p.type === "property" && p.key === key
      );
      if (existing) {
        existing.value = value;
      } else {
        props.push({ type: "property", key, value });
      }
    };

    setOrReplace("reactNativeArchitectures", archs.join(","));
    setOrReplace("android.enableMinifyInReleaseBuilds", "true");
    setOrReplace("android.enableShrinkResourcesInReleaseBuilds", "true");
    setOrReplace("VisionCamera_enableFrameProcessors", "false");
    setOrReplace("expo.useLegacyPackaging", "true");
    // SPLIT_APKS=true → per-arch APKs (build-release-apk)
    // SPLIT_APKS unset  → single AAB without splits conflict (build-release)
    setOrReplace("android.enableAbiSplits", process.env.SPLIT_APKS === "true" ? "true" : "false");

    console.log(
      `[expo-plugin-architectures] Set reactNativeArchitectures=${archs.join(",")}`
    );
    console.log(
      "[expo-plugin-architectures] Enabled R8 minification + resource shrinking"
    );
    console.log(
      "[expo-plugin-architectures] Disabled VisionCamera frame processors"
    );
    console.log(
      "[expo-plugin-architectures] Enabled legacy packaging (smaller APK for sideloading)"
    );
    return cfg;
  });

  config = withAppBuildGradle(config, (cfg) => {
    const abiFilters = archs.map((a) => `"${a}"`).join(", ");
    const ndkBlock = `        ndk {\n            abiFilters ${abiFilters}\n        }`;

    // 1. ndk abiFilters
    if (cfg.modResults.contents.includes("ndk {")) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /ndk\s*\{[^}]*\}/,
        `ndk {\n            abiFilters ${abiFilters}\n        }`
      );
    } else {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /(versionName\s+["'][^"']*["'])/,
        `$1\n${ndkBlock}`
      );
    }

    // 2. 16KB page size alignment (Android 15+ / Google Play requirement)
    if (!cfg.modResults.contents.includes("ANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES")) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /(ndk\s*\{[^}]*\})/,
        `$1\n        externalNativeBuild {\n            cmake {\n                arguments "-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON"\n            }\n        }`
      );
      console.log("[expo-plugin-architectures] Added 16KB page size alignment flag");
    }

    // 3. resConfigs — keep only Ukrainian and English, strip everything else from libs
    if (!cfg.modResults.contents.includes("resConfigs")) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /(ndk\s*\{[^}]*\})/,
        `$1\n        resConfigs "uk", "en"`
      );
      console.log("[expo-plugin-architectures] Added resConfigs 'uk', 'en'");
    }

    // 4. splits block — controlled by android.enableAbiSplits gradle property.
    // APK builds (SPLIT_APKS=true): enable=true → per-arch APKs + universal APK.
    // AAB builds (default):         enable=false → no conflict with shrinkResources
    //   (issuetracker.google.com/402800800).
    // Architecture filtering for AAB is handled by ndk.abiFilters above.
    const splitsBlock = [
      "    splits {",
      "        abi {",
      "            reset()",
      "            enable = (findProperty('android.enableAbiSplits') ?: 'false').toBoolean()",
      "            universalApk true",
      `            include ${abiFilters}`,
      "        }",
      "    }",
    ].join("\n");

    if (!cfg.modResults.contents.includes("splits {")) {
      if (cfg.modResults.contents.includes("buildTypes")) {
        cfg.modResults.contents = cfg.modResults.contents.replace(
          /(\s+)(buildTypes\s*\{)/,
          `\n${splitsBlock}\n$1$2`
        );
      } else {
        cfg.modResults.contents = cfg.modResults.contents.replace(
          /(\n\})\s*$/,
          `\n${splitsBlock}\n$1`
        );
      }
    } else {
      // Update existing splits block to use findProperty
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /splits\s*\{[^}]*abi\s*\{[^}]*\}[^}]*\}/s,
        splitsBlock
      );
    }

    console.log(
      `[expo-plugin-architectures] splits.abi controlled by android.enableAbiSplits (SPLIT_APKS=${process.env.SPLIT_APKS || "false"})`
    );

    console.log(
      `[expo-plugin-architectures] Set ndk.abiFilters=${archs.join(",")}`
    );
    return cfg;
  });

  // Append ProGuard rules required for R8 to work with all libraries in the project
  config = withDangerousMod(config, [
    "android",
    async (cfg) => {
      const proguardPath = path.join(
        cfg.modRequest.platformProjectRoot,
        "app",
        "proguard-rules.pro"
      );

      const optimizationRules = `

# ============================================================
# Size optimization rules (auto-generated by expo-plugin-architectures)
# ============================================================

# React Native / JNI bridge — must be kept for JS<->native calls
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.soloader.** { *; }

# Expo modules
-keep class expo.modules.** { *; }

# Reanimated & Gesture Handler
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.rnscreens.** { *; }

# Notifee
-keep class io.invertase.notifee.** { *; }
-keep class app.notifee.core.** { *; }

# MMKV
-keep class com.tencent.mmkv.** { *; }

# FFmpeg Kit
-keep class com.arthenica.ffmpegkit.** { *; }

# Vision Camera
-keep class com.mrousavy.camera.** { *; }

# Annotations & debug info
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keepattributes Signature
-keepattributes Exceptions

# Keep exception subclasses (crash reporting)
-keep public class * extends java.lang.Exception

# OkHttp / networking
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# Kotlin
-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-keepclassmembers class **$WhenMappings { <fields>; }
-keepclassmembers class kotlin.Metadata { public <methods>; }
-keepclassmembernames class kotlinx.** { volatile <fields>; }

# Native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# JavaScript interface (WebView bridge)
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
`;

      if (fs.existsSync(proguardPath)) {
        const current = fs.readFileSync(proguardPath, "utf8");
        if (!current.includes("# Size optimization rules")) {
          fs.writeFileSync(proguardPath, current + optimizationRules);
          console.log(
            "[expo-plugin-architectures] Appended ProGuard optimization rules"
          );
        }
      }

      return cfg;
    },
  ]);

  return config;
};

module.exports = withArchitectures;
