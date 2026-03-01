/**
 * Dev CORS proxy for AniUA web.
 * Proxies requests to external APIs that don't support CORS.
 *
 * Usage: node web/proxy-server.js
 * Proxy runs on http://localhost:3001
 *
 * Routes:
 *   /api/aniua/*  → https://api-aniua.yuzka.site/*
 *   /api/hikka/*  → https://api.hikka.io/*
 */

const http = require("http");
const https = require("https");
const { URL } = require("url");

const PORT = 3001;

const ROUTES = {
  "/api/aniua/": "https://api-aniua.yuzka.site/",
  "/api/hikka-features/": "https://api.hikka-features.pp.ua/",
  "/api/hikka/": "https://api.hikka.io/",
};

function findTarget(pathname) {
  for (const [prefix, target] of Object.entries(ROUTES)) {
    if (pathname.startsWith(prefix)) {
      return { prefix, target };
    }
  }
  return null;
}

const server = http.createServer((req, res) => {
  // CORS preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Expose-Headers", "*");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const route = findTarget(req.url);
  if (!route) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found. Use /api/aniua/* or /api/hikka/*");
    return;
  }

  const targetPath = req.url.slice(route.prefix.length);
  const targetUrl = new URL(targetPath, route.target);
  targetUrl.search = new URL(req.url, "http://localhost").search;

  const proxyHeaders = { ...req.headers };
  proxyHeaders.host = targetUrl.host;
  delete proxyHeaders["origin"];
  delete proxyHeaders["referer"];

  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port || 443,
    path: targetUrl.pathname + targetUrl.search,
    method: req.method,
    headers: proxyHeaders,
  };

  const proxyReq = https.request(options, (proxyRes) => {
    // Copy response headers, skip CORS (we set our own)
    const headers = { ...proxyRes.headers };
    delete headers["access-control-allow-origin"];
    delete headers["access-control-allow-methods"];
    delete headers["access-control-allow-headers"];

    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (err) => {
    console.error(`Proxy error: ${err.message}`);
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end(`Proxy error: ${err.message}`);
  });

  req.pipe(proxyReq);
});

server.listen(PORT, () => {
  console.log(`CORS proxy running on http://localhost:${PORT}`);
  console.log("Routes:");
  for (const [prefix, target] of Object.entries(ROUTES)) {
    console.log(`  ${prefix}* → ${target}*`);
  }
});
