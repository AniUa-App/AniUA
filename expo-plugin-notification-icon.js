const fs = require("fs");
const path = require("path");
const { withDangerousMod, withAndroidManifest } = require("expo/config-plugins");

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function tryCopyPrebuiltVector(projectRoot, dst) {
  const srcXml = path.join(projectRoot, "assets", "ic_stat_aniua.xml");
  if (!fs.existsSync(srcXml)) return false;
  ensureDir(dst);
  fs.copyFileSync(srcXml, dst);
  return true;
}

function parseSvgViewBox(svg) {
  // Try viewBox first
  const vb = svg.match(/viewBox\s*=\s*"([^"]+)"/i);
  if (vb) {
    const parts = vb[1].trim().split(/\s+/).map(Number);
    if (parts.length === 4) {
      return { width: parts[2], height: parts[3] };
    }
  }
  // Fallback to width/height
  const w = svg.match(/width\s*=\s*"(\d+(?:\.\d+)?)\D*"/i);
  const h = svg.match(/height\s*=\s*"(\d+(?:\.\d+)?)\D*"/i);
  const width = w ? Number(w[1]) : 24;
  const height = h ? Number(h[1]) : 24;
  return { width, height };
}

function extractPathData(svg) {
  const paths = [];
  const regex = /<path[^>]*d="([^"]+)"[^>]*>/gi;
  let m;
  while ((m = regex.exec(svg)) !== null) {
    paths.push(m[1]);
  }
  return paths;
}

function generateVectorFromSvg(projectRoot, dst) {
  const svgPath = path.join(projectRoot, "assets", "AniUA-Logo.svg");
  if (!fs.existsSync(svgPath)) return false;
  try {
    const svg = fs.readFileSync(svgPath, "utf8");
    const { width, height } = parseSvgViewBox(svg);
    const pathDataList = extractPathData(svg);
    if (pathDataList.length === 0) return false;
    const header = `<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="${width}" android:viewportHeight="${height}">`;
    const groupStart = `<group android:translateY="${height}" android:scaleY="-1">`;
    const paths = pathDataList
      .map(
        (d) => `<path android:fillColor="#FFFFFFFF" android:pathData="${d}"/>`
      )
      .join("\n");
    const xml = `${header}\n${groupStart}\n${paths}\n</group>\n</vector>\n`;
    ensureDir(dst);
    fs.writeFileSync(dst, xml, "utf8");
    return true;
  } catch (e) {
    console.warn(
      "[expo-plugin-notification-icon] SVG to Vector generation failed:",
      e?.message || e
    );
    return false;
  }
}

const withNotificationIcon = (config) => {
  // Pin ic_stat_aniua via AndroidManifest <meta-data android:resource="@mipmap/ic_stat_aniua">.
  // The resource shrinker ALWAYS keeps resources referenced in the manifest, so this is
  // more reliable than keep.xml alone (which can be ignored when shrinkResources is enabled
  // and R8 can't statically trace getIdentifier() calls at compile time).
  config = withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application?.[0];
    if (app) {
      if (!app["meta-data"]) app["meta-data"] = [];
      const META_NAME = "app.notifee.default_notification_icon";
      const already = app["meta-data"].find(
        (m) => m.$?.["android:name"] === META_NAME
      );
      if (!already) {
        app["meta-data"].push({
          $: {
            "android:name": META_NAME,
            "android:resource": "@mipmap/ic_stat_aniua",
          },
        });
        console.log(
          "[expo-plugin-notification-icon] Added manifest meta-data pin for ic_stat_aniua"
        );
      }
    }
    return cfg;
  });

  return withDangerousMod(config, [
    "android",
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const resBase = path.join(
        projectRoot,
        "android",
        "app",
        "src",
        "main",
        "res"
      );
      // Primary location: drawable (for older API compatibility)
      const dst = path.join(resBase, "drawable", "ic_stat_aniua.xml");
      // Mipmap location: notifee checks mipmap BEFORE drawable at runtime.
      // Adding the icon here ensures it is always found in release builds.
      const dstMipmap = path.join(
        resBase,
        "mipmap-anydpi-v26",
        "ic_stat_aniua.xml"
      );

      try {
        let xmlContent = null;

        // Try pre-built vector first
        const srcXml = path.join(projectRoot, "assets", "ic_stat_aniua.xml");
        if (fs.existsSync(srcXml)) {
          xmlContent = fs.readFileSync(srcXml, "utf8");
        } else {
          // Generate from SVG
          const svgPath = path.join(projectRoot, "assets", "AniUA-Logo.svg");
          if (fs.existsSync(svgPath)) {
            const svg = fs.readFileSync(svgPath, "utf8");
            const { width, height } = parseSvgViewBox(svg);
            const pathDataList = extractPathData(svg);
            if (pathDataList.length > 0) {
              const header = `<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="${width}" android:viewportHeight="${height}">`;
              const groupStart = `<group android:translateY="${height}" android:scaleY="-1">`;
              const paths = pathDataList
                .map(
                  (d) =>
                    `<path android:fillColor="#FFFFFFFF" android:pathData="${d}"/>`
                )
                .join("\n");
              xmlContent = `${header}\n${groupStart}\n${paths}\n</group>\n</vector>\n`;
            }
          }
        }

        if (xmlContent) {
          // Write to drawable/
          ensureDir(dst);
          fs.writeFileSync(dst, xmlContent, "utf8");
          // Write to mipmap-anydpi-v26/ so notifee finds it via mipmap lookup first
          ensureDir(dstMipmap);
          fs.writeFileSync(dstMipmap, xmlContent, "utf8");
          console.log(
            "[expo-plugin-notification-icon] Notification icon written to drawable/ and mipmap-anydpi-v26/"
          );
        } else {
          console.warn(
            "[expo-plugin-notification-icon] No icon source found. Provide assets/ic_stat_aniua.xml or assets/AniUA-Logo.svg"
          );
        }
      } catch (e) {
        console.warn(
          "[expo-plugin-notification-icon] Failed to prepare icon:",
          e?.message || e
        );
      }

      // Keep ic_stat_aniua from being stripped by resource shrinker
      const keepXmlPath = path.join(resBase, "raw", "keep.xml");
      const keepXmlContent = `<?xml version="1.0" encoding="utf-8"?>\n<resources xmlns:tools="http://schemas.android.com/tools"\n    tools:keep="@drawable/ic_stat_aniua,@mipmap/ic_stat_aniua" />\n`;
      ensureDir(keepXmlPath);
      fs.writeFileSync(keepXmlPath, keepXmlContent, "utf8");
      console.log(
        "[expo-plugin-notification-icon] Written keep.xml for drawable and mipmap ic_stat_aniua"
      );

      return cfg;
    },
  ]);
};

module.exports = withNotificationIcon;
