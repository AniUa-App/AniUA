const fs = require("fs");
const path = require("path");
const { withDangerousMod } = require("expo/config-plugins");

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
  return withDangerousMod(config, [
    "android",
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const dst = path.join(
        projectRoot,
        "android",
        "app",
        "src",
        "main",
        "res",
        "drawable",
        "ic_stat_aniua.xml"
      );
      try {
        let ok = tryCopyPrebuiltVector(projectRoot, dst);
        if (!ok) {
          ok = generateVectorFromSvg(projectRoot, dst);
          if (ok) {
            console.log(
              "[expo-plugin-notification-icon] Generated ic_stat_aniua.xml from assets/AniUA-Logo.svg"
            );
          }
        }
        if (ok) {
          console.log(
            "[expo-plugin-notification-icon] Notification icon ready at:",
            dst
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
      return cfg;
    },
  ]);
};

module.exports = withNotificationIcon;
